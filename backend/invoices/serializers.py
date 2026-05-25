from rest_framework import serializers
from .models import Invoice, InvoiceItem, InvoicePayment


class InvoiceItemSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source="product.product_name",
        read_only=True
    )

    class Meta:
        model = InvoiceItem
        fields = "__all__"

class InvoicePaymentSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = InvoicePayment

        fields = "__all__"