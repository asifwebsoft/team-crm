from django.urls import path

from .views import CreateInvoiceView, InvoiceListView, UpdateInvoiceStatusView, InvoiceDetailView


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

]