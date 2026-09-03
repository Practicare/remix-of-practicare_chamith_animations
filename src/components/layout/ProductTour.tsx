import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface ProductTourProps {
  open: boolean;
  onClose: () => void;
}

const TOUR_STEPS: Step[] = [
  {
    target: "[data-tour='user-profile']",
    title: "Your Profile",
    content: "This is your account info. You can see your name, role, and quickly log out from here.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "[data-tour='quick-actions']",
    title: "Quick Actions",
    content: "Submit feature requests, send feedback, or refer a friend to earn discounts — all in one click.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "[data-tour='sms-credits']",
    title: "SMS Credits",
    content: "Monitor your SMS balance at a glance. Click here to top up credits whenever you need more.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "[data-tour='nav-dashboard']",
    title: "Dashboard",
    content: "Your command centre — see personal tasks, critical alerts, performance metrics, and upcoming events all in one place.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "[data-tour='nav-staff']",
    title: "Staff Management",
    content: "Add team members, assign roles and permissions, manage departments, and view detailed staff profiles.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "[data-tour='nav-compliance']",
    title: "Compliance Tracking",
    content: "Never miss an expiry. Track licences, certifications, and inspections with automated alerts.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "[data-tour='nav-stock']",
    title: "Stock Management",
    content: "Monitor inventory levels, track expiry dates, set reorder thresholds, and get low-stock alerts.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "[data-tour='nav-tasks']",
    title: "Tasks",
    content: "Create, assign, and track tasks with priorities and due dates. View as a list or Kanban board.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "[data-tour='nav-checklists']",
    title: "Checklists",
    content: "Build reusable checklists for daily ops — opening procedures, cleaning protocols, safety checks — and assign to staff.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "[data-tour='nav-memos']",
    title: "Memos & News",
    content: "Broadcast updates to your team, track who's read each memo, and send reminders to those who haven't.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "[data-tour='nav-settings']",
    title: "Settings",
    content: "Configure your practice profile, departments, roles, billing, SMS, and email preferences.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "[data-tour='nav-training']",
    title: "Training & Resources",
    content: "Watch orientation videos and browse help guides to get the most out of Practicare.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "[data-tour='main-content']",
    title: "Main Content Area",
    content: "This is where all your page content appears. Navigate using the sidebar to explore each module.",
    placement: "left",
    disableBeacon: true,
  },
];

export function ProductTour({ open, onClose }: ProductTourProps) {
  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onClose();
    }
  };

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={open}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      callback={handleCallback}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip Tour",
      }}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "hsl(var(--primary))",
          textColor: "hsl(var(--foreground))",
          backgroundColor: "hsl(var(--card))",
          arrowColor: "hsl(var(--card))",
          overlayColor: "rgba(0, 0, 0, 0.5)",
        },
        tooltip: {
          borderRadius: "12px",
          padding: "20px",
          fontSize: "14px",
        },
        tooltipTitle: {
          fontSize: "16px",
          fontWeight: 700,
          marginBottom: "8px",
        },
        tooltipContent: {
          fontSize: "13px",
          lineHeight: "1.6",
          padding: "8px 0",
        },
        buttonNext: {
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "13px",
          fontWeight: 600,
        },
        buttonBack: {
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "13px",
          fontWeight: 500,
          marginRight: "8px",
          color: "hsl(var(--muted-foreground))",
        },
        buttonSkip: {
          fontSize: "13px",
          color: "hsl(var(--muted-foreground))",
        },
        spotlight: {
          borderRadius: "12px",
        },
        overlay: {
          mixBlendMode: undefined as any,
        },
      }}
      floaterProps={{
        disableAnimation: false,
      }}
    />
  );
}
