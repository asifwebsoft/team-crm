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

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:

            plan = request.data.get("plan")

            PLAN_PRICES = {
                "basic": 199,
                "pro": 499,
                "advance": 799
            }

            if plan not in PLAN_PRICES:

                return Response({
                    "error": "Invalid plan"
                }, status=400)

            amount = PLAN_PRICES[plan]

            order_id = str(uuid.uuid4())

            customer_details = CustomerDetails(
                customer_id=str(request.user.id),
                customer_phone="9999999999"
            )

            order_meta = OrderMeta(
                return_url=f"https://team-crm-roan.vercel.app/payment-success?plan={plan}"
            )

            create_order_request = CreateOrderRequest(
                order_amount=amount,
                order_currency="INR",
                order_id=order_id,
                customer_details=customer_details,
                order_meta=order_meta
            )

            x_api_version = "2023-08-01"

            app_id = settings.CASHFREE_APP_ID.strip()
            secret_key = settings.CASHFREE_SECRET_KEY.strip()

            cashfree = Cashfree(
                Cashfree.SANDBOX,
                app_id,
                secret_key
            )

            response = cashfree.PGCreateOrder(
                x_api_version,
                create_order_request
            )

            return Response({
                "payment_session_id": response.data.payment_session_id,
                "order_id": response.data.order_id,
                "plan": plan,
                "amount": amount
            })

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

            plan = request.data.get("plan", "pro")

            # invalid plan
            if plan not in PLAN_DETAILS:

                return Response({
                    "error": "Invalid plan"
                }, status=400)

            # deactivate old subscription
            Subscription.objects.filter(
                user=request.user,
                is_active=True
            ).update(is_active=False)

            # create new subscription
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
                "error": str(e)
            }, status=400)