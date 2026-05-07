from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from subscriptions.models import Subscription


class SubscriptionMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_authenticator = JWTAuthentication()

    def __call__(self, request):

        path = request.path

        # 🔓 admin panel bypass
        if path.startswith('/admin'):
            return self.get_response(request)

        # 🔓 AUTH ROUTES BYPASS (VERY IMPORTANT)
        if (
            path.startswith('/api/accounts/login/') or
            path.startswith('/api/accounts/admin-signup/') or
            path.startswith('/api/accounts/staff-signup/') or
            path.startswith('/api/token/refresh/')
        ):
            return self.get_response(request)

        # 🔓 subscription routes bypass
        if path.startswith('/api/subscription'):
            return self.get_response(request)

        # 🔓 company routes bypass
        if path.startswith('/api/company'):
            return self.get_response(request)

        # 🔥 JWT से user निकालो
        try:
            user_auth_tuple = self.jwt_authenticator.authenticate(request)
            if user_auth_tuple is not None:
                request.user, _ = user_auth_tuple
            else:
                request.user = None
        except:
            request.user = None

        print("USER:", request.user)

        user = request.user

        if user:

            if user.role == "admin":

                has_subscription = Subscription.objects.filter(
                    user=user,
                    is_active=True
                ).exists()

                if not has_subscription:
                    return JsonResponse(
                        {"error": "No active subscription"},
                        status=403
                    )

                if not user.company:
                    return JsonResponse(
                        {"error": "No company"},
                        status=403
                    )

        return self.get_response(request)