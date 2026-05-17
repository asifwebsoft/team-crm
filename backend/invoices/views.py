from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import models

from .models import Invoice, InvoiceItem
from .permissions import CanCreateInvoice


class CreateInvoiceView(APIView):

    permission_classes = [
        IsAuthenticated,
        CanCreateInvoice
    ]

    def post(self, request):

        try:

            data = request.data

            items = data.get("items", [])

            # ✅ VALIDATION

            customer_name = data.get(
                "customer_name",
                ""
            ).strip()

            phone = data.get(
                "phone",
                ""
            ).strip()

            address = data.get(
                "address",
                ""
            ).strip()

            # ✅ REQUIRED FIELDS

            if not customer_name:

                return Response(
                    {
                        "error": "Customer name required"
                    },
                    status=400
                )

            if not phone:

                return Response(
                    {
                        "error": "Phone number required"
                    },
                    status=400
                )

            if not address:

                return Response(
                    {
                        "error": "Address required"
                    },
                    status=400
                )

            # ✅ PRODUCTS REQUIRED

            if not items:

                return Response(
                    {
                        "error": "At least one product required"
                    },
                    status=400
                )

            # ✅ PRODUCT VALIDATION

            for item in items:

                product_name = str(
                    item.get(
                        "product_name",
                        ""
                    )
                ).strip()

                quantity = int(
                    item.get(
                        "quantity",
                        0
                    )
                )

                price = float(
                    item.get(
                        "price",
                        0
                    )
                )

                if not product_name:

                    return Response(
                        {
                            "error": "Product name required"
                        },
                        status=400
                    )

                if quantity <= 0:

                    return Response(
                        {
                            "error": "Quantity must be greater than 0"
                        },
                        status=400
                    )

                if price <= 0:

                    return Response(
                        {
                            "error": "Price must be greater than 0"
                        },
                        status=400
                    )

            total_amount = 0

            # ✅ GENERATE INVOICE NUMBER

            last_invoice = Invoice.objects.order_by(
                "-id"
            ).first()

            if last_invoice:

                next_id = last_invoice.id + 1

            else:

                next_id = 1

            invoice_number = (
                f"INV-{next_id:04d}"
            )

            # ✅ CREATE INVOICE

            invoice = Invoice.objects.create(
                invoice_number=invoice_number,
                customer_name=customer_name,
                phone=phone,
                address=address,
                status=data.get(
                    "status",
                    "pending"
                ),
                created_by=request.user,
                company=request.user.company
            )

            # ✅ CREATE INVOICE ITEMS

            for item in items:

                quantity = int(
                    item.get(
                        "quantity",
                        1
                    )
                )

                price = float(
                    item.get(
                        "price",
                        0
                    )
                )

                subtotal = quantity * price

                total_amount += subtotal

                InvoiceItem.objects.create(
                    invoice=invoice,
                    product_name=item.get(
                        "product_name"
                    ),
                    quantity=quantity,
                    price=price,
                    subtotal=subtotal
                )

            invoice.total_amount = total_amount

            invoice.save()

            return Response(
                {
                    "message": "Invoice created successfully",
                    "invoice_id": invoice.id,
                    "invoice_number": invoice.invoice_number,
                    "total_amount": invoice.total_amount
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class InvoiceListView(APIView):

    permission_classes = [
        IsAuthenticated,
        CanCreateInvoice
    ]

    def get(self, request):

        user = request.user

        # ✅ ADMIN

        if user.role == "admin":

            invoices = Invoice.objects.filter(
                company=user.company
            ).order_by("-id")

        # ✅ MANAGER

        elif user.role == "manager":

            invoices = Invoice.objects.filter(
                company=user.company
            ).filter(
                models.Q(created_by=user) |
                models.Q(created_by__manager=user)
            ).order_by("-id")

        # ✅ STAFF

        else:

            invoices = Invoice.objects.filter(
                company=user.company,
                created_by=user
            ).order_by("-id")

        data = []

        for invoice in invoices:

            data.append({
                "id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "customer_name": invoice.customer_name,
                "phone": invoice.phone,
                "address": invoice.address,
                "status": invoice.status,
                "total_amount": invoice.total_amount,
                "created_by": invoice.created_by.full_name if invoice.created_by else "",
                "created_at": invoice.created_at.strftime(
                    "%d-%m-%Y %I:%M %p"
                ),
            })

        return Response(data)


class UpdateInvoiceStatusView(APIView):

    permission_classes = [
        IsAuthenticated,
        CanCreateInvoice
    ]

    def patch(self, request, pk):

        try:

            invoice = Invoice.objects.get(
                id=pk,
                company=request.user.company
            )

            # ✅ ONLY ADMIN & MANAGER

            if request.user.role not in [
                "admin",
                "manager"
            ]:

                return Response(
                    {
                        "error": "Permission denied"
                    },
                    status=403
                )

            # ✅ MANAGER SECURITY

            if request.user.role == "manager":

                is_team_invoice = (
                    invoice.created_by.manager ==
                    request.user
                    if invoice.created_by.manager
                    else False
                )

                if (
                    invoice.created_by != request.user
                    and not is_team_invoice
                ):

                    return Response(
                        {
                            "error": "Permission denied"
                        },
                        status=403
                    )

            invoice.status = request.data.get(
                "status",
                invoice.status
            )

            invoice.save()

            return Response({
                "message": "Status updated"
            })

        except Invoice.DoesNotExist:

            return Response(
                {
                    "error": "Invoice not found"
                },
                status=404
            )


class InvoiceDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        CanCreateInvoice
    ]

    def get(self, request, pk):

        try:

            invoice = Invoice.objects.get(
                id=pk,
                company=request.user.company
            )

            # ✅ STAFF SECURITY

            if request.user.role == "staff":

                if invoice.created_by != request.user:

                    return Response(
                        {
                            "error": "Permission denied"
                        },
                        status=403
                    )

            # ✅ MANAGER SECURITY

            elif request.user.role == "manager":

                is_team_invoice = (
                    invoice.created_by.manager ==
                    request.user
                    if invoice.created_by.manager
                    else False
                )

                if (
                    invoice.created_by != request.user
                    and not is_team_invoice
                ):

                    return Response(
                        {
                            "error": "Permission denied"
                        },
                        status=403
                    )

            items = []

            for item in invoice.items.all():

                items.append({
                    "product_name": item.product_name,
                    "quantity": item.quantity,
                    "price": item.price,
                    "subtotal": item.subtotal,
                })

            data = {
                "id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "customer_name": invoice.customer_name,
                "phone": invoice.phone,
                "address": invoice.address,
                "status": invoice.status,
                "total_amount": invoice.total_amount,
                "created_by": invoice.created_by.full_name,
                "created_at": invoice.created_at.strftime(
                    "%d-%m-%Y %I:%M %p"
                ),
                "items": items,
            }

            return Response(data)

        except Invoice.DoesNotExist:

            return Response(
                {
                    "error": "Invoice not found"
                },
                status=404
            )