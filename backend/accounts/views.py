from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone
from .serializers import SignupSerializer
from .models import LoginActivity
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

User = get_user_model()


# ✅ LOGIN
class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()

        if not user:
            return Response({"error": "User not found"}, status=400)

        if not user.check_password(password):
            return Response({"error": "Wrong password"}, status=400)

        # 🔥 LOGIN TRACK
        LoginActivity.objects.create(user=user)

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role,
            "name": user.full_name,
            "user_id": user.id,
            "company": user.company.name if user.company else "CRM"
        })


# ✅ LOGOUT
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        activity = LoginActivity.objects.filter(
            user=request.user,
            logout_time__isnull=True
        ).last()

        if activity:
            activity.logout_time = timezone.now()
            activity.save()

        return Response({"message": "Logged out"})


# ✅ LOGIN ACTIVITY (FIXED)
class LoginActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # 👑 ADMIN → पूरी company (INCLUDING MANAGER)
        if user.role == "admin":
            activities = LoginActivity.objects.filter(
                user__company=user.company
            ).exclude(user__role="admin")

        # 🧑‍💼 MANAGER → खुद + team
        elif user.role == "manager":
            activities = LoginActivity.objects.filter(
                user__company=user.company
            ).filter(
                user__manager=user
            ) | LoginActivity.objects.filter(user=user)

        # 👨‍💻 STAFF → खुद
        else:
            activities = LoginActivity.objects.filter(user=user)

        data = []

        for a in activities.order_by("-login_time"):
            logout_time = a.logout_time
            end_time = logout_time if logout_time else timezone.now()
            duration = end_time - a.login_time

            data.append({
                "id": a.id,
                "name": a.user.full_name,
                "user_id": a.user.id,
                "login": a.login_time.strftime("%d-%m-%Y %H:%M"),
                "logout": logout_time.strftime("%d-%m-%Y %H:%M") if logout_time else "Active",
                "duration": str(duration).split(".")[0]
            })

        return Response(data)


# ✅ ADMIN SIGNUP
class AdminSignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            user.role = "admin"
            user.save()

            return Response({"message": "Admin created"})
            print(serializer.errors)

        return Response(serializer.errors, status=400)


# ✅ STAFF / MANAGER CREATE
class StaffSignupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        if request.user.role not in ["admin", "manager"]:
            return Response({"error": "Access denied"}, status=403)

        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            role = request.data.get("role", "staff")
            if role not in ["staff", "manager"]:
                role = "staff"

            user.role = role
            user.company = request.user.company

            # 🔥 MANAGER ASSIGN
            if request.user.role == "admin":
                manager_id = request.data.get("manager_id")

                if manager_id:
                    try:
                        manager = User.objects.get(
                            id=manager_id,
                            company=request.user.company,
                            role="manager"
                        )
                        user.manager = manager
                    except User.DoesNotExist:
                        user.manager = None

                else:
                    user.manager = None

            # 🔥 manager → auto assign to self
            elif request.user.role == "manager":
                user.manager = request.user

            user.save()

            return Response({"message": f"{user.role.capitalize()} created"})

        return Response(serializer.errors, status=400)


# ✅ STAFF LIST (FIXED)
class StaffListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # 👑 ADMIN → सब (manager + staff)
        if request.user.role == "admin":
            staff = User.objects.filter(
                company=request.user.company
            ).exclude(role="admin")

        # 🧑‍💼 MANAGER → अपनी team
        elif request.user.role == "manager":
            staff = User.objects.filter(
                company=request.user.company,
                manager=request.user
            )

        else:
            return Response({"error": "Access denied"}, status=403)

        data = [
            {
                "id": u.id,
                "name": u.full_name,
                "email": u.email,
                "mobile": u.mobile,
                "role": u.role,
            }
            for u in staff
        ]

        return Response(data)


# ✅ UPDATE STAFF (FIXED)
class UpdateStaffView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != "admin":
            return Response({"error": "Only admin allowed"}, status=403)

        try:
            user = User.objects.get(
                id=pk,
                company=request.user.company
            )

            user.full_name = request.data.get("full_name", user.full_name)
            user.email = request.data.get("email", user.email)
            user.mobile = request.data.get("mobile", user.mobile)
            user.role = request.data.get("role", user.role)

            manager_id = request.data.get("manager_id")

            if manager_id:
                try:
                    manager = User.objects.get(
                        id=manager_id,
                        company=request.user.company,
                        role="manager"
                    )
                    user.manager = manager
                except User.DoesNotExist:
                    user.manager = None
            else:
                user.manager = None

            user.save()

            return Response({"message": "Updated"})

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)


# ✅ DELETE STAFF
class DeleteStaffView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != "admin":
            return Response({"error": "Only admin allowed"}, status=403)

        try:
            user = User.objects.get(
                id=pk,
                company=request.user.company
            )

            # ❗ admin delete नहीं करना
            if user.role == "admin":
                return Response({"error": "Cannot delete admin"}, status=400)

            user.delete()

            return Response({"message": "Deleted"})

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        

# ✅ FORGOT PASSWORD
class ForgotPasswordView(APIView):

    def post(self, request):

        email = request.data.get("email")

        user = User.objects.filter(email=email).first()

        if not user:
            return Response(
                {"error": "Email not found"},
                status=404
            )

        token = default_token_generator.make_token(user)

        uid = urlsafe_base64_encode(force_bytes(user.pk))

        reset_link = f"http://localhost:3000/reset-password/{uid}/{token}"

        send_mail(
            "Reset Your Password",
            f"Click here to reset password:\n{reset_link}",
            "noreply@crm.com",
            [email],
            fail_silently=False,
        )

        return Response({
            "message": "Reset link sent to email"
        })