from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q
from accounts.models import User
from django.db import models
from decimal import Decimal
from .models import( 
        Invoice, 
        InvoiceItem,
        InvoicePayment
     )
from .permissions import CanCreateInvoice
from inventory.models import InventoryItem


class CreateInvoiceView(APIView):

    permission_classes = [
        IsAuthenticated,
        CanCreateInvoice
    ]

    def post(self, request):

        try:

            data = request.data

            items = data.get("items", [])

            # ✅ CUSTOMER DETAILS

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

            # ✅ VALIDATION

            if not customer_name:

                return Response(
                    {
                        "error":
                        "Customer name required"
                    },
                    status=400
                )

            if not phone:

                return Response(
                    {
                        "error":
                        "Phone number required"
                    },
                    status=400
                )

            if not address:

                return Response(
                    {
                        "error":
                        "Address required"
                    },
                    status=400
                )

            if not items:

                return Response(
                    {
                        "error":
                        "At least one product required"
                    },
                    status=400
                )

            # ✅ VALIDATE ITEMS

            for item in items:

                product_id = item.get(
                    "product"
                )

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

                if not product_id:

                    return Response(
                        {
                            "error":
                            "Product required"
                        },
                        status=400
                    )

                if quantity <= 0:

                    return Response(
                        {
                            "error":
                            "Quantity must be greater than 0"
                        },
                        status=400
                    )

                if price <= 0:

                    return Response(
                        {
                            "error":
                            "Price must be greater than 0"
                        },
                        status=400
                    )

            # ✅ TOTAL

            total_amount = 0

            # ✅ GST %

            cgst = float(
                data.get(
                    "cgst",
                    0
                ) or 0
            )

            sgst = float(
                data.get(
                    "sgst",
                    0
                ) or 0
            )

            # ✅ INVOICE NUMBER

            last_invoice = Invoice.objects.order_by(
                "-id"
            ).first()

            if last_invoice:

                next_id = (
                    last_invoice.id + 1
                )

            else:

                next_id = 1

            invoice_number = (
                f"INV-{next_id:04d}"
            )

            # ✅ CREATE INVOICE

            invoice = Invoice.objects.create(

                invoice_number=
                    invoice_number,

                customer_name=
                    customer_name,

                phone=phone,

                address=address,

                status=data.get(
                    "status",
                    "pending"
                ),

                created_by=
                    request.user,

                company=
                    request.user.company,

                total_amount=0,

                cgst=0,

                sgst=0,

                grand_total=0,

                # ✅ PAYMENT SYSTEM

                paid_amount=0,

                due_amount=0
            )

            # ✅ CREATE ITEMS

            for item in items:

                product_id = item.get(
                    "product"
                )

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

                # ✅ INVENTORY PRODUCT

                product = InventoryItem.objects.get(

                    id=product_id,

                    company=
                        request.user.company
                )

                # ✅ STOCK CHECK

                if (
                    product.stock_quantity
                    <
                    quantity
                ):

                    return Response(
                        {
                            "error":
                            f"{product.product_name} out of stock"
                        },
                        status=400
                    )

                subtotal = (
                    quantity * price
                )

                total_amount += subtotal

                # ✅ REDUCE STOCK

                product.stock_quantity -= quantity

                product.save()

                # ✅ CREATE ITEM

                InvoiceItem.objects.create(

                    invoice=invoice,

                    product=product,

                    product_name=
                        product.product_name,

                    unit=
                        product.unit,

                    quantity=quantity,

                    price=price,

                    subtotal=subtotal
                )

            # ✅ GST AMOUNT

            cgst_amount = (
                total_amount * cgst
            ) / 100

            sgst_amount = (
                total_amount * sgst
            ) / 100

            # ✅ GRAND TOTAL

            grand_total = (

                total_amount +

                cgst_amount +

                sgst_amount
            )

            # ✅ UPDATE INVOICE

            invoice.total_amount = (
                total_amount
            )

            invoice.cgst = (
                cgst_amount
            )

            invoice.sgst = (
                sgst_amount
            )

            invoice.grand_total = (
                grand_total
            )

            # ✅ PAYMENT INIT

            invoice.paid_amount = 0

            invoice.due_amount = (
                grand_total
            )

            invoice.save()

            return Response(

                {
                    "message":
                    "Invoice created successfully",

                    "invoice_id":
                    invoice.id,

                    "invoice_number":
                    invoice.invoice_number,

                    "total_amount":
                    invoice.total_amount,

                    "cgst":
                    invoice.cgst,

                    "sgst":
                    invoice.sgst,

                    "grand_total":
                    invoice.grand_total,

                    "paid_amount":
                    invoice.paid_amount,

                    "due_amount":
                    invoice.due_amount,
                },

                status=
                status.HTTP_201_CREATED
            )

        except InventoryItem.DoesNotExist:

            return Response(
                {
                    "error":
                    "Invalid inventory product"
                },
                status=400
            )

        except Exception as e:

            return Response(

                {
                    "error": str(e)
                },

                status=
                status.HTTP_400_BAD_REQUEST
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

                if (
                    invoice.created_by
                    != request.user
                ):

                    return Response(
                        {
                            "error":
                            "Permission denied"
                        },
                        status=403
                    )

            # ✅ MANAGER SECURITY

            elif request.user.role == "manager":

                is_team_invoice = (

                    invoice.created_by.manager
                    == request.user

                    if invoice.created_by.manager

                    else False
                )

                if (

                    invoice.created_by
                    != request.user

                    and not is_team_invoice

                ):

                    return Response(
                        {
                            "error":
                            "Permission denied"
                        },
                        status=403
                    )

            # ✅ PAYMENTS

            payments = []

            for payment in invoice.payments.all():

                payments.append({

                    "id":
                        payment.id,

                    "amount":
                        payment.amount,

                    "payment_method":
                        payment.payment_method,

                    "note":
                        payment.note,

                    "created_at":
                        payment.created_at.strftime(
                            "%d-%m-%Y %I:%M %p"
                        ),
                })

            # ✅ ITEMS

            items = []

            for item in invoice.items.all():

                items.append({

                    "product_name":
                        item.product_name,

                    "unit":
                        item.unit,

                    "quantity":
                        item.quantity,

                    "price":
                        item.price,

                    "subtotal":
                        item.subtotal,
                })

            # ✅ GST VALUES

            subtotal = (
                invoice.total_amount
            )

            cgst = (
                invoice.cgst
            )

            sgst = (
                invoice.sgst
            )

            grand_total = (

                invoice.grand_total

                or

                subtotal
            )

            # ✅ RESPONSE DATA

            data = {

                "id":
                    invoice.id,

                "invoice_number":
                    invoice.invoice_number,

                "customer_name":
                    invoice.customer_name,

                "phone":
                    invoice.phone,

                "address":
                    invoice.address,

                "status":
                    invoice.status,

                "total_amount":
                    invoice.total_amount,

                "cgst":
                    cgst,

                "sgst":
                    sgst,

                "grand_total":
                    grand_total,

                # ✅ PAYMENT DATA

                "paid_amount":
                    invoice.paid_amount,

                "due_amount":
                    invoice.due_amount,

                # ✅ USER

                "created_by":
                    invoice.created_by.full_name,

                "created_at":
                    invoice.created_at.strftime(
                        "%d-%m-%Y %I:%M %p"
                    ),

                # ✅ COMPANY DETAILS

                "company_name":
                    request.user.company.name,

                "company_address":
                    getattr(
                        request.user.company,
                        "address",
                        ""
                    ),

                "company_email":
                    getattr(
                        request.user.company,
                        "email",
                        ""
                    ),

                "company_mobile":
                    getattr(
                        request.user.company,
                        "contact_number",
                        ""
                    ),

                "company_gstin":
                    getattr(
                        request.user.company,
                        "gstin",
                        ""
                    ),

                # ✅ ITEMS

                "items":
                    items,

                # ✅ PAYMENTS

                "payments":
                    payments,
            }

            return Response(data)

        except Invoice.DoesNotExist:

            return Response(
                {
                    "error":
                    "Invoice not found"
                },
                status=404
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=400
            )

class UpdateInvoiceView(APIView):

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

            # ✅ STAFF BLOCKED

            if request.user.role == "staff":

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

            # ✅ SAFE FIELDS

            customer_name = request.data.get(
                "customer_name",
                invoice.customer_name
            ).strip()

            phone = request.data.get(
                "phone",
                invoice.phone
            ).strip()

            address = request.data.get(
                "address",
                invoice.address
            ).strip()

            status_value = request.data.get(
                "status",
                invoice.status
            )

            # ✅ VALIDATION

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
                        "error": "Phone required"
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

            if not phone.isdigit():

                return Response(
                    {
                        "error": "Phone must contain only numbers"
                    },
                    status=400
                )

            if len(phone) < 10:

                return Response(
                    {
                        "error": "Phone must be at least 10 digits"
                    },
                    status=400
                )

            if len(phone) > 12:

                return Response(
                    {
                        "error": "Phone cannot exceed 12 digits"
                    },
                    status=400
                )

            # ✅ UPDATE

            invoice.customer_name = customer_name
            invoice.phone = phone
            invoice.address = address
            invoice.status = status_value

            invoice.save()

            return Response({
                "message": "Invoice updated successfully"
            })

        except Invoice.DoesNotExist:

            return Response(
                {
                    "error": "Invoice not found"
                },
                status=404
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=400
            )
        
class CustomerLedgerView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        company = request.user.company

        invoices = Invoice.objects.filter(
                company=company
            )

        customers = {}

        for invoice in invoices:

            name = invoice.customer_name

            if name not in customers:

                customers[name] = {

                    "customer_name":
                        name,

                    "phone":
                        invoice.phone,

                    "total_amount": 0,

                    "paid_amount": 0,

                    "due_amount": 0,

                    "invoice_count": 0,
                }

            grand_total = float(
                    invoice.grand_total
                    or 0
                )

            customers[name][
                "total_amount"
            ] += grand_total

            customers[name][
                "invoice_count"
            ] += 1

            # ✅ PAID

            if invoice.status == "paid":

                customers[name][
                    "paid_amount"
                ] += grand_total

            # ✅ DUE

            else:

                customers[name][
                    "due_amount"
                ] += grand_total

        return Response(
            list(customers.values())
        )
    



class AddInvoicePaymentView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request, pk):

        try:

            invoice = Invoice.objects.get(
                id=pk,
                company=request.user.company
            )

            amount = Decimal(

                str(

                    request.data.get(
                        "amount",
                        0
                    )
                )
            )

            payment_method = request.data.get(
                    "payment_method",
                    "cash"
                )

            note = request.data.get(
                "note",
                ""
            )

            # ✅ VALIDATION

            if amount <= 0:

                return Response(
                    {
                        "error":
                        "Invalid payment amount"
                    },
                    status=400
                )

            if amount > invoice.due_amount:

                return Response(
                    {
                        "error":
                        "Payment exceeds due amount"
                    },
                    status=400
                )

            # ✅ SAVE PAYMENT

            InvoicePayment.objects.create(

                invoice=invoice,

                amount=amount,

                payment_method=
                    payment_method,

                note=note,

                created_by=
                    request.user
            )

            # ✅ UPDATE INVOICE

            invoice.paid_amount = (

                invoice.paid_amount
                +
                amount
            )

            invoice.due_amount = (

                invoice.due_amount
                -
                amount
            )

            # ✅ STATUS UPDATE

            if invoice.due_amount <= 0:

                invoice.status = "paid"

                invoice.due_amount = 0

            else:

                invoice.status = "partial"

            invoice.save()

            return Response({

                "message":
                    "Payment added successfully",

                "paid_amount":
                    invoice.paid_amount,

                "due_amount":
                    invoice.due_amount,

                "status":
                    invoice.status,
            })

        except Invoice.DoesNotExist:

            return Response(
                {
                    "error":
                    "Invoice not found"
                },
                status=404
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=400
            )


class EmployeeSalesAnalyticsView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        invoices = Invoice.objects.filter(
            company=user.company
        )

        # ✅ STAFF

        if user.role == "staff":

            invoices = invoices.filter(
                created_by=user
            )

        # ✅ MANAGER

        elif user.role == "manager":

            team_users = User.objects.filter(
                manager=user
            )

            invoices = invoices.filter(

                Q(created_by=user)

                |

                Q(created_by__in=team_users)
            )

        # ✅ MONTH FILTER

        month = request.GET.get(
            "month"
        )

        year = request.GET.get(
            "year"
        )

        if month and year:

            invoices = invoices.filter(

                created_at__month=month,

                created_at__year=year
            )

        # ✅ EMPLOYEE DATA

        employee_data = {}

        for invoice in invoices:

            employee = (
                invoice.created_by
            )

            if not employee:
                continue

            employee_id = employee.id

            if employee_id not in employee_data:

                employee_data[
                    employee_id
                ] = {

                    "employee_name":
                        employee.full_name,

                    "invoice_count":
                        0,

                    "total_sales":
                        0,
                }

            employee_data[
                employee_id
            ][
                "invoice_count"
            ] += 1

            employee_data[
                employee_id
            ][
                "total_sales"
            ] += float(
                invoice.grand_total
                or 0
            )

        return Response(
            list(
                employee_data.values()
            )
        )