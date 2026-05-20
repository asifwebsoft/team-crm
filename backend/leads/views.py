from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date
from .models import Lead
from accounts.models import User
from .models import LeadFollowupHistory



# 🔐 STRICT EDIT PERMISSION
def can_edit_lead(user, lead):
    return lead.assigned_to == user


# 🔥 COMMON FILTER
def get_leads(user):
    if user.role == "admin":
        return Lead.objects.filter(company=user.company)

    elif user.role == "manager":
        team = User.objects.filter(company=user.company, manager=user)
        return Lead.objects.filter(
            company=user.company,
            assigned_to__in=list(team) + [user]
        )

    return Lead.objects.filter(
        company=user.company,
        assigned_to=user
    )


# ✅ CREATE
# ✅ CREATE
class CreateLeadView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        lead = Lead.objects.create(

            title=request.data.get("title"),

            customer_name=request.data.get(
                "customer_name"
            ),

            phone=request.data.get("phone"),

            notes=request.data.get("notes"),

            followup_date=request.data.get(
                "followup_date"
            ) or None,

            assigned_to=request.user,

            company=request.user.company
        )

        # ✅ CREATE HISTORY

        LeadFollowupHistory.objects.create(

            lead=lead,

            customer_name=lead.customer_name,

            phone=lead.phone,

            notes=lead.notes,

            next_followup_date=
                lead.followup_date,

            created_by=request.user,

            company=request.user.company
        )

        return Response({
            "id": lead.id
        })

class DashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        leads = get_leads(request.user)

        today = date.today()

        today_followups = leads.filter(
            followup_date=today
        ).exclude(status="closed")

        upcoming_followups = leads.filter(
            followup_date__gt=today
        ).exclude(status="closed")

        overdue_followups = leads.filter(
            followup_date__lt=today
        ).exclude(status="closed")

        return Response({

            "total_leads": leads.count(),

            "today_followups": [
                {
                    "id": l.id,
                    "name": l.customer_name,
                }
                for l in today_followups
            ],

            "upcoming_followups": [
                {
                    "id": l.id,
                    "name": l.customer_name,
                }
                for l in upcoming_followups
            ],

            "overdue_followups": [
                {
                    "id": l.id,
                    "name": l.customer_name,
                }
                for l in overdue_followups
            ],

        })

# ✅ MY LEADS
class MyLeadsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        leads = get_leads(request.user)

        return Response([
            {
                "id": l.id,
                "title": l.title,
                "customer_name": l.customer_name,
                "phone": l.phone,
                "notes": l.notes,
                "status": l.status,
                "assigned_to": l.assigned_to.id if l.assigned_to else None,
                "followup_date": str(l.followup_date) if l.followup_date else None
            }
            for l in leads.order_by("-id")
        ])


# ✅ UPDATE
# ✅ UPDATE
class UpdateLeadView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        try:

            lead = Lead.objects.get(
                id=pk,
                company=request.user.company
            )

        except Lead.DoesNotExist:

            return Response(
                {
                    "error": "Not found"
                },
                status=404
            )

        # 🔐 EDIT PERMISSION

        if not can_edit_lead(
            request.user,
            lead
        ):

            return Response(
                {
                    "error": "Not allowed"
                },
                status=403
            )

        # ✅ GET UPDATED VALUES

        new_notes = request.data.get(
            "notes",
            lead.notes
        )

        new_followup_date = request.data.get(
            "followup_date",
            lead.followup_date
        )

        new_status = request.data.get(
            "status",
            lead.status
        )

        # ✅ CREATE FOLLOWUP HISTORY

        if (
            request.data.get("notes")
            or
            request.data.get("followup_date")
        ):

            LeadFollowupHistory.objects.create(

                lead=lead,

                customer_name=lead.customer_name,

                phone=lead.phone,

                notes=new_notes,

                next_followup_date=
                    new_followup_date,

                created_by=request.user,

                company=request.user.company
            )

        # ✅ UPDATE LEAD

        lead.notes = new_notes

        lead.followup_date = new_followup_date

        lead.status = new_status

        lead.save()

        return Response({
            "message": "Updated"
        })


# ✅ DELETE
class DeleteLeadView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            lead = Lead.objects.get(id=pk, company=request.user.company)
        except Lead.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        if not can_edit_lead(request.user, lead):
            return Response({"error": "Not allowed"}, status=403)

        lead.delete()
        return Response({"message": "Deleted"})


# ✅ ASSIGN
class AssignLeadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            lead = Lead.objects.get(id=pk, company=request.user.company)
        except Lead.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        assign_id = request.data.get("assigned_to")

        try:
            user = User.objects.get(id=assign_id, company=request.user.company)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # 🔐 manager restriction
        if request.user.role == "manager":
            if user.manager != request.user:
                return Response({"error": "Only your team"}, status=403)

        if request.user.role == "staff":
            return Response({"error": "Access denied"}, status=403)

        lead.assigned_to = user
        lead.save()

        return Response({"message": "Assigned"})


# ✅ NOTIFICATIONS
class NotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        leads = get_leads(request.user)
        today = date.today()

        data = []

        today_leads = leads.filter(
            followup_date=today
        ).exclude(status="closed")

        overdue_leads = leads.filter(
            followup_date__lt=today
        ).exclude(status="closed")

        for l in today_leads:

            data.append({
                "id": l.id,
                "name": l.customer_name,
                "title": getattr(l, "title", "Lead"),
                "type": "today",
                "date": str(l.followup_date)
            })

        for l in overdue_leads:

            data.append({
                "id": l.id,
                "name": l.customer_name,
                "title": getattr(l, "title", "Lead"),
                "type": "overdue",
                "date": str(l.followup_date)
            })

        return Response({
            "count": len(data),
            "data": data
        })


# ✅ FOLLOWUPS
from datetime import date, timedelta

class FollowupReminderView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        leads = get_leads(request.user)

        today = date.today()

        today_data = []
        overdue_data = []
        upcoming_data = []

        # ✅ TODAY
        today_leads = leads.filter(
            followup_date=today
        ).exclude(status="closed")

        for l in today_leads:

            today_data.append({
                "id": l.id,
                "name": l.customer_name,
                "phone": l.phone,
                "date": str(l.followup_date),
            })

        # ✅ OVERDUE
        overdue_leads = leads.filter(
            followup_date__lt=today
        ).exclude(status="closed")

        for l in overdue_leads:

            overdue_data.append({
                "id": l.id,
                "name": l.customer_name,
                "phone": l.phone,
                "date": str(l.followup_date),
            })

        # ✅ UPCOMING
        upcoming_leads = leads.filter(
            followup_date__gt=today
        ).exclude(status="closed").order_by("followup_date")

        for l in upcoming_leads:

            upcoming_data.append({
                "id": l.id,
                "name": l.customer_name,
                "phone": l.phone,
                "date": str(l.followup_date),
            })

        return Response({
            "today": today_data,
            "overdue": overdue_data,
            "upcoming": upcoming_data,
        })


# ✅ TEAM PERFORMANCE
class TeamPerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == "admin":
            users = User.objects.filter(company=user.company).exclude(role="admin")
        elif user.role == "manager":
            users = User.objects.filter(
                company=user.company
            ).filter(Q(manager=user) | Q(id=user.id))
        else:
            users = [user]

        data = []

        for u in users:
            leads = Lead.objects.filter(company=user.company, assigned_to=u)

            total = leads.count()
            closed = leads.filter(status="closed").count()
            percent = round((closed / total) * 100, 2) if total else 0

            data.append({
                "name": u.full_name,
                "total": total,
                "closed": closed,
                "conversion": percent
            })

        return Response(sorted(data, key=lambda x: x["conversion"], reverse=True))


# ✅ CONVERSION (same as team performance)
class ConversionView(TeamPerformanceView):
    pass


# ✅ MANAGER DASHBOARD
class ManagerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "manager":
            return Response({"error": "Access denied"}, status=403)

        leads = get_leads(request.user)
        today = date.today()

        return Response({
            "total": leads.count(),
            "closed": leads.filter(status="closed").count(),
            "today": leads.filter(followup_date=today).count()
        })
    
# ADD LEADS
class AddLeadFollowupView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request, pk):

        try:

            lead = Lead.objects.get(
                id=pk,
                company=request.user.company
            )

            # ✅ STAFF SECURITY

            if request.user.role == "staff":

                if lead.assigned_to != request.user:

                    return Response(
                        {
                            "error": "Permission denied"
                        },
                        status=403
                    )

            # ✅ MANAGER SECURITY

            elif request.user.role == "manager":

                is_team_lead = False

                if (
                    lead.assigned_to
                    and lead.assigned_to.manager
                ):

                    is_team_lead = (

                        lead.assigned_to.manager
                        == request.user

                    )

                if (
                    lead.assigned_to != request.user
                    and not is_team_lead
                ):

                    return Response(
                        {
                            "error": "Permission denied"
                        },
                        status=403
                    )

            notes = request.data.get(
                "notes",
                ""
            ).strip()

            next_followup_date = request.data.get(
                "next_followup_date"
            )

            # ✅ VALIDATION

            if not notes:

                return Response(
                    {
                        "error": "Notes required"
                    },
                    status=400
                )

            # ✅ CREATE HISTORY

            LeadFollowupHistory.objects.create(

                lead=lead,

                customer_name=lead.customer_name,

                phone=lead.phone,

                notes=notes,

                next_followup_date=
                    next_followup_date,

                created_by=request.user,

                company=request.user.company
            )

            return Response({
                "message": "Follow-up added successfully"
            })

        except Lead.DoesNotExist:

            return Response(
                {
                    "error": "Lead not found"
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
# ✅ LEAD HISTORY
class LeadHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        # ✅ ADMIN

        if user.role == "admin":

            history = LeadFollowupHistory.objects.filter(
                company=user.company
            )

        # ✅ MANAGER

        elif user.role == "manager":

            team = User.objects.filter(
                company=user.company,
                manager=user
            )

            history = LeadFollowupHistory.objects.filter(
                company=user.company
            ).filter(

                Q(created_by__in=team)
                |
                Q(created_by=user)

            )

        # ✅ STAFF

        else:

            history = LeadFollowupHistory.objects.filter(
                company=user.company,
                created_by=user
            )

        history = history.order_by(
            "-created_at"
        )

        return Response([

            {

                "id": h.id,

                "lead_name":
                    h.customer_name,

                "phone":
                    h.phone,

                "notes":
                    h.notes,

                "next_followup_date":
                    str(h.next_followup_date)
                    if h.next_followup_date
                    else None,

                "created_by":
                    h.created_by.full_name,

                "created_at":
                    h.created_at.strftime(
                        "%d-%m-%Y %I:%M %p"
                    )

            }

            for h in history

        ])