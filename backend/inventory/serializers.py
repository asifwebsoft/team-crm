from rest_framework import serializers
from .models import InventoryItem
from .models import (
    InventoryItem,
    PurchaseEntry
)



class InventorySerializer(serializers.ModelSerializer):

    class Meta:
        model = InventoryItem
        fields = "__all__"

class PurchaseEntrySerializer(
    serializers.ModelSerializer
):

    product_name = serializers.CharField(
            source=
            "product.product_name",
            read_only=True
        )

    class Meta:

        model = PurchaseEntry

        fields = "__all__"