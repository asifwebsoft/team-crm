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
import base64
from django.utils.http import (
    urlsafe_base64_encode,
    urlsafe_base64_decode
)

from django.utils.encoding import (
    force_bytes,
    force_str
)
from urllib.parse import quote
import resend
import os


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
            return Response(
                {"error": "User not found"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(password):
            return Response(
                {"error": "Wrong password"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ CLOSE OLD ACTIVE SESSIONS
        LoginActivity.objects.filter(
            user=user,
            logout_time__isnull=True
        ).update(
            logout_time=timezone.now()
        )

        # ✅ CREATE NEW LOGIN ENTRY
        LoginActivity.objects.create(
            user=user
        )

        # ✅ JWT TOKEN
        refresh = RefreshToken.for_user(user)

        # ✅ RESPONSE
        return Response({

            "message": "Login successful",

            "access": str(refresh.access_token),
            "refresh": str(refresh),

            "role": user.role,
            "name": user.full_name,
            "user_id": user.id,

            "company": (
                user.company.name
                if user.company
                else ""
            ),

            "email": user.email,

        }, status=status.HTTP_200_OK)

        # 🔥 LOGIN TRACK

class LoginActivityView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        activities = LoginActivity.objects.all().order_by("-login_time")

        data = []

        for a in activities:

            login_time = localtime(a.login_time)

            logout_time = (
                localtime(a.logout_time)
                if a.logout_time
                else None
            )

            # ACTIVE / CLOSED SESSION
            end_time = a.logout_time or timezone.now()

            # SAFETY CHECK
            total_seconds = max(
                int((end_time - a.login_time).total_seconds()),
                0
            )

            # TIME CALCULATION
            hours = total_seconds // 3600

            minutes = (
                total_seconds % 3600
            ) // 60

            seconds = total_seconds % 60

            # PROPER FORMAT
            duration = f"{hours}h {minutes}m {seconds}s"

            data.append({

                "id": a.id,

                "name": (
                    a.user.get_full_name()
                    or a.user.username
                ),

                "user_id": a.user.id,

                "login": login_time.strftime(
                    "%d-%m-%Y %I:%M:%S %p"
                ),

                "logout": (
                    logout_time.strftime(
                        "%d-%m-%Y %I:%M:%S %p"
                    )
                    if logout_time
                    else None
                ),

                "is_active": a.logout_time is None,

                "duration": duration,

            })

        return Response(data)

# ✅ LOGOUT
class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        # ACTIVE SESSION FIND
        activity = LoginActivity.objects.filter(
            user=request.user,
            logout_time__isnull=True
        ).last()

        # LOGOUT TIME SAVE
        if activity:

            activity.logout_time = timezone.now()

            activity.save()

        return Response({
            "message": "Logged out successfully"
        })


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

        try:
            serializer = SignupSerializer(data=request.data)

            if serializer.is_valid():
                user = serializer.save()
                user.role = "admin"
                user.save()

                return Response({"message": "Admin created"})

            return Response({
                "serializer_error": serializer.errors
            }, status=400)

        except Exception as e:
            return Response({
                "python_error": str(e)
            }, status=500)


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

        try:

            email = request.data.get(
                "email"
            )

            user = User.objects.filter(
                email=email
            ).first()

            if not user:

                return Response(
                    {
                        "error":
                        "Email not found"
                    },
                    status=404
                )

            # ✅ GENERATE TOKEN

            raw_token = (
                default_token_generator
                .make_token(user)
            )

            token = base64.urlsafe_b64encode(
                raw_token.encode()
            ).decode()

            # ✅ GENERATE UID

            uid = (
                urlsafe_base64_encode(
                    force_bytes(user.pk)
                )
            )

            # ✅ RESET LINK

            reset_link = (

                f"https://team-crm-roan.vercel.app"

                f"/reset-password/{uid}/{token}"
            )

            print(
                "RESET LINK =>",
                reset_link
            )

            # ✅ RESEND API

            resend.api_key = os.getenv(
                "RESEND_API_KEY"
            )

            print(
                "RESEND KEY =>",
                os.getenv("RESEND_API_KEY")
            )

            # ✅ SEND EMAIL
            resend.Emails.send({

    "from":
    "onboarding@resend.dev",

    "to":
    [email],

    "subject":
    "Reset Your Password",

    "html":
    f"<h2>Reset Password</h2>"
    f"<p>Click below to reset your password:</p>"
    f"<a href='{reset_link}'>Reset Password</a>"
})

            return Response(
                {
                    "message":
                    "Reset link sent successfully"
                }
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=400
            )

# ✅ RESET PASSWORD

class ResetPasswordView(APIView):

    def post(self, request):

        try:

            uidb64 = request.data.get(
                "uid"
            )

            token = request.data.get(
                "token"
            )

            # ✅ DECODE TOKEN

            token = (
                base64.urlsafe_b64decode(
                    token.encode()
                ).decode()
            )

            password = request.data.get(
                "password"
            )

            if not password:

                return Response(
                    {
                        "error":
                        "Password required"
                    },
                    status=400
                )

            # ✅ DECODE UID

            decoded_uid = force_str(
                urlsafe_base64_decode(
                    uidb64
                )
            )

            # ✅ GET USER

            user = User.objects.get(
                pk=decoded_uid
            )

            # ✅ TOKEN CHECK

            if not (
                default_token_generator
                .check_token(
                    user,
                    token
                )
            ):

                return Response(
                    {
                        "error":
                        "Invalid or expired token"
                    },
                    status=400
                )

            # ✅ RESET PASSWORD

            user.set_password(
                password
            )

            user.save()

            return Response(
                {
                    "message":
                    "Password reset successful"
                }
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=400
            )

