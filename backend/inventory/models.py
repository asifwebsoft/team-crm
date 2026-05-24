from django.db import models
from companies.models import Company


class InventoryItem(models.Model):

    UNIT_CHOICES = (
        ("Piece", "Piece"),
        ("Packet", "Packet"),
        ("Kg", "Kg"),
        ("Gram", "Gram"),
        ("Litre", "Litre"),
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="inventory_items"
    )

    product_name = models.CharField(max_length=255)

    unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES
    )

    stock_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    low_stock_limit = models.DecimalField(
    max_digits=10,
    decimal_places=2,
    default=10
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product_name