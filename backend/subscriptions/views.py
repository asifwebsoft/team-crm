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
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        plan = request.data.get("plan")

        # ❌ invalid plan
        if plan not in PLAN_DETAILS:
            return Response({"error": "Invalid plan"}, status=400)

        amount = PLAN_DETAILS[plan]["price"]

        try:
            order = client.order.create({
                "amount": amount * 100,  # paise
                "currency": "INR",
                "payment_capture": 1
            })

            return Response({
                "order_id": order["id"],
                "amount": amount,
                "plan": plan,
                "key": settings.RAZORPAY_KEY_ID
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)


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