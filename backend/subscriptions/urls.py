from django.urls import path
from .views import CreateOrder, VerifyPayment

urlpatterns = [
    path('create-order/', CreateOrder.as_view()),
    path('verify/', VerifyPayment.as_view()),
]