from django.urls import path

from .views import (
    CreateInvoiceView,
    InvoiceListView,
    UpdateInvoiceStatusView,
    InvoiceDetailView,
    UpdateInvoiceView,
    CustomerLedgerView,
    AddInvoicePaymentView
)


urlpatterns = [
    path(
        'create/',
        CreateInvoiceView.as_view(),
        name='create-invoice'
    ),
    path(
        'list/',
        InvoiceListView.as_view(),
        name='invoice-list'
    ),
    path(
    'status/<int:pk>/',
    UpdateInvoiceStatusView.as_view()
    
    ),
    path(
    '<int:pk>/',
    InvoiceDetailView.as_view()
    ),

    path(
    "update/<int:pk>/",
    UpdateInvoiceView.as_view()
   ),

   path(
    "customer-ledger/",
    CustomerLedgerView.as_view()
    ),

    path(
    "payment/<int:pk>/",
    AddInvoicePaymentView.as_view()
),

]