from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.utils.timezone import now
from datetime import timedelta
from .models import Subscription
from cashfree_pg.api_client import Cashfree
from cashfree_pg.models.create_order_request import CreateOrderRequest
from cashfree_pg.models.customer_details import CustomerDetails
from cashfree_pg.models.order_meta import OrderMeta
from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView
import uuid


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

    def post(self, request):

        try:

            Cashfree.XClientId = settings.CASHFREE_APP_ID
            Cashfree.XClientSecret = settings.CASHFREE_SECRET_KEY
            Cashfree.XEnvironment = Cashfree.SANDBOX

            order_id = str(uuid.uuid4())

            customer_details = CustomerDetails(
                customer_id="123",
                customer_phone="9999999999"
            )

            order_meta = OrderMeta(
                return_url="https://team-crm-roan.vercel.app/payment-success?order_id={order_id}"
            )

            create_order_request = CreateOrderRequest(
                order_amount=1.0,
                order_currency="INR",
                order_id=order_id,
                customer_details=customer_details,
                order_meta=order_meta
            )

            response = Cashfree().PGCreateOrder(create_order_request)

            return Response(response.data)

        except Exception as e:

            print("CASHFREE ERROR:", str(e))

            return Response({
                "error": str(e)
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