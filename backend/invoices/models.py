from django.db import models
from django.conf import settings
from companies.models import Company
from leads.models import Lead
from inventory.models import InventoryItem

User = settings.AUTH_USER_MODEL


class Invoice(models.Model):

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("partial", "Partial"),
    )

    invoice_number = models.CharField(
        max_length=50,
        unique=True
    )

    lead = models.ForeignKey(
        Lead,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    customer_name = models.CharField(max_length=255)

    phone = models.CharField(
        max_length=20,
        blank=True
    )

    address = models.TextField(
    blank=True,
    null=True
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    cgst = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    sgst = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    grand_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    paid_amount = models.DecimalField(
    max_digits=10,
    decimal_places=2,
    default=0
)

    due_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.invoice_number


class InvoiceItem(models.Model):

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="items"
    )

    # ✅ INVENTORY PRODUCT LINK

    product = models.ForeignKey(
        InventoryItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # ✅ PRODUCT SNAPSHOT
    # Future me inventory rename/delete ho jaye
    # tab bhi old invoice safe rahe

    product_name = models.CharField(
        max_length=255
    )

    # ✅ UNIT SNAPSHOT

    unit = models.CharField(
        max_length=20,
        blank=True
    )

    # ✅ QUANTITY

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1
    )

    # ✅ PRICE

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    # ✅ SUBTOTAL

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        if self.product_name:

            return self.product_name

        if self.product:

            return self.product.product_name

        return "Invoice Item"
    

class InvoicePayment(models.Model):

    PAYMENT_METHODS = (

        ("cash", "Cash"),

        ("upi", "UPI"),

        ("bank", "Bank Transfer"),
    )

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="payments"
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        default="cash"
    )

    note = models.TextField(
        blank=True,
        null=True
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return (
            f"{self.invoice.invoice_number}"
            f" - ₹{self.amount}"
        )