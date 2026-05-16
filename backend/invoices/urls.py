from django.urls import path

from .views import CreateInvoiceView, InvoiceListView, UpdateInvoiceStatusView


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
    UpdateInvoiceStatusView.as_view(),
    
),
]