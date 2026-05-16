from django.urls import path

from .views import CreateInvoiceView, InvoiceListView


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
]