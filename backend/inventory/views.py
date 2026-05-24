from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import InventoryItem, PurchaseEntry
from .serializers import (
    InventorySerializer,
    PurchaseEntrySerializer
)
from decimal import Decimal


class InventoryListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        company = request.user.company

        items = InventoryItem.objects.filter(
            company=company
        ).order_by("-id")

        serializer = InventorySerializer(items, many=True)

        return Response(serializer.data)

    def post(self, request):

        data = request.data.copy()

        data["company"] = request.user.company.id

        serializer = InventorySerializer(data=data)

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=400)
    

class PurchaseEntryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        purchases = PurchaseEntry.objects.filter(
                company=
                request.user.company
            ).order_by("-id")

        serializer = PurchaseEntrySerializer(
                purchases,
                many=True
            )

        return Response(
            serializer.data
        )

    def post(self, request):

        try:

            product_id = request.data.get(
                    "product"
                )

            quantity = Decimal(
                str(
                    request.data.get(
                        "quantity",
                        0
                    )
                )
            )

            supplier_name = request.data.get(
                    "supplier_name",
                    ""
                )

            note = request.data.get(
                    "note",
                    ""
                )

            if quantity <= 0:

                return Response(
                    {
                        "error":
                        "Quantity must be greater than 0"
                    },
                    status=400
                )

            product = InventoryItem.objects.get(
                    id=product_id,
                    company=
                    request.user.company
                )

            # ✅ STOCK INCREASE

            product.stock_quantity = (

                Decimal(
                    str(product.stock_quantity)
                )

                +

                quantity
            )

            product.save()

            # ✅ SAVE PURCHASE

            purchase = PurchaseEntry.objects.create(

                    product=product,

                    quantity=quantity,

                    supplier_name=
                        supplier_name,

                    note=note,

                    created_by=
                        request.user,

                    company=
                        request.user.company
                )

            serializer = PurchaseEntrySerializer(
                    purchase
                )

            return Response(
                serializer.data,
                status=201
            )

        except Exception as e:
            print("PURCHASE ERROR:", e)

            return Response(
                {
                    "error":
                    str(e)
                },
                status=400
            )