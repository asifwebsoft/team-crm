from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import razorpay
from django.conf import settings
from django.utils.timezone import now
from datetime import timedelta

from .models import Subscription


# 🔥 PLAN CONFIG
PLAN_DETAILS = {
    "basic": {
        "price": 199,
        "days": 30
    },
    "pro": {
        "price": 499,
        "days": 90
    },
    "advance": {
        "price": 799,
        "days": 365
    }
}


# 🔥 CREATE ORDER
class CreateOrder(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        # 🔒 Razorpay keys check
        if not hasattr(settings, "RAZORPAY_KEY_ID") or not hasattr(settings, "RAZORPAY_KEY_SECRET"):
            return Response({
                "error": "Razorpay keys missing in settings"
            }, status=500)

        plan = request.data.get("plan")

        # ❌ invalid plan
        if plan not in PLAN_DETAILS:
            return Response({
                "error": "Invalid plan"
            }, status=400)

        amount = PLAN_DETAILS[plan]["price"]

        try:

            print("Key id = ", settings.RAZORPAY_KEY_ID)
            print("Key Secret = ", settings.RAZORPAY_KEY_SECRET)

            client = razorpay.Client(
                auth=(
                    settings.RAZORPAY_KEY_ID,
                    settings.RAZORPAY_KEY_SECRET
                )
            )

            order = client.order.create(data={

                "amount": int(amount * 100),
                "currency": "INR",
                "payment_capture": 1
            })

            return Response({
                "success": True,
                "order_id": order["id"],
                "amount": amount,
                "plan": plan,
                "key": settings.RAZORPAY_KEY_ID
            })

        except Exception as e:

            print("RAZORPAY ERROR:", str(e))

            return Response({
                "error": "Unable to create payment order"
            }, status=500)


# 🔥 VERIFY PAYMENT
class VerifyPayment(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:

            client = razorpay.Client(
                auth=(
                    settings.RAZORPAY_KEY_ID,
                    settings.RAZORPAY_KEY_SECRET
                )
            )

            data = request.data

            # 🔒 VERIFY SIGNATURE
            client.utility.verify_payment_signature({
                "razorpay_order_id": data.get("razorpay_order_id"),
                "razorpay_payment_id": data.get("razorpay_payment_id"),
                "razorpay_signature": data.get("razorpay_signature"),
            })

            plan = data.get("plan")

            # ❌ invalid plan
            if plan not in PLAN_DETAILS:
                return Response({
                    "error": "Invalid plan"
                }, status=400)

            # 🔥 deactivate old subscription
            Subscription.objects.filter(
                user=request.user,
                is_active=True
            ).update(is_active=False)

            # 🔥 create new subscription
            start = now()
            end = start + timedelta(
                days=PLAN_DETAILS[plan]["days"]
            )

            Subscription.objects.create(
                user=request.user,
                plan=plan,
                is_active=True,
                start_date=start,
                end_date=end
            )

            return Response({
                "success": True,
                "message": "Subscription activated",
                "plan": plan,
                "valid_till": end
            })

        except Exception as e:

            print("VERIFY ERROR:", str(e))

            return Response({
                "error": "Payment verification failed"
            }, status=400)