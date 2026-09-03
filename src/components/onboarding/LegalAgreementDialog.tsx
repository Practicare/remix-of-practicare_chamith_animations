import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Shield, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LegalAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "terms" | "privacy";
  onAccept: () => void;
}

const TERMS_CONTENT = `
# Terms and Conditions

Last updated: January 2025

## 1. Acceptance of Terms

By accessing and using Practicare ("the Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use the Service.

## 2. Description of Service

Practicare is a practice management platform designed to help healthcare and professional service organizations manage their operations, including but not limited to:
- Task and checklist management
- Compliance tracking
- Stock and inventory management
- Internal communications

## 3. User Accounts

### 3.1 Registration
To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.

### 3.2 Account Security
You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.

## 4. Use of the Service

### 4.1 Permitted Use
You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
- In any way that violates applicable laws or regulations
- To transmit any harmful, threatening, or offensive material
- To attempt to gain unauthorized access to any part of the Service

### 4.2 Data Accuracy
You are solely responsible for the accuracy and completeness of any data you enter into the Service.

## 5. Intellectual Property

The Service and its original content, features, and functionality are owned by Practicare and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.

## 6. Data Protection

We are committed to protecting your data. Please refer to our Privacy Policy for information about how we collect, use, and protect your personal information.

## 7. Service Availability

We strive to maintain high availability of the Service but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue the Service at any time without prior notice.

## 8. Limitation of Liability

To the maximum extent permitted by law, Practicare shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.

## 9. Changes to Terms

We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service.

## 10. Contact Us

If you have any questions about these Terms, please contact us at legal@practicare.com.
`;

const PRIVACY_CONTENT = `
# Privacy Policy

Last updated: January 2025

## 1. Introduction

Practicare ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.

## 2. Information We Collect

### 2.1 Personal Information
We may collect personal information that you voluntarily provide, including:
- Name and contact information
- Email address
- Phone number
- Professional credentials
- Employment information

### 2.2 Usage Data
We automatically collect certain information when you use the Service:
- Device and browser information
- IP address
- Pages visited and features used
- Time and date of access

## 3. How We Use Your Information

We use the information we collect to:
- Provide and maintain the Service
- Improve and personalize user experience
- Send administrative information
- Respond to inquiries and support requests
- Comply with legal obligations

## 4. Data Sharing and Disclosure

We do not sell your personal information. We may share your information with:
- Service providers who assist in operating our Service
- Legal authorities when required by law
- Business partners with your consent

## 5. Data Security

We implement appropriate technical and organizational measures to protect your personal information, including:
- Encryption of data in transit and at rest
- Regular security assessments
- Access controls and authentication
- Employee training on data protection

## 6. Data Retention

We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.

## 7. Your Rights

Depending on your location, you may have rights regarding your personal information, including:
- Right to access your data
- Right to correct inaccurate data
- Right to delete your data
- Right to data portability
- Right to withdraw consent

## 8. Cookies and Tracking

We use cookies and similar tracking technologies to enhance your experience. You can control cookie preferences through your browser settings.

## 9. Children's Privacy

Our Service is not intended for children under 16. We do not knowingly collect information from children under 16.

## 10. International Data Transfers

Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.

## 11. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.

## 12. Contact Us

If you have questions about this Privacy Policy, please contact us at privacy@practicare.com.
`;

export function LegalAgreementDialog({
  open,
  onOpenChange,
  type,
  onAccept,
}: LegalAgreementDialogProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isTerms = type === "terms";
  const content = isTerms ? TERMS_CONTENT : PRIVACY_CONTENT;
  const title = isTerms ? "Terms and Conditions" : "Privacy Policy";
  const Icon = isTerms ? FileText : Shield;

  // Reset scroll state when dialog opens
  useEffect(() => {
    if (open) {
      setHasScrolledToBottom(false);
      setShowScrollHint(true);
    }
  }, [open]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isAtBottom) {
      setHasScrolledToBottom(true);
      setShowScrollHint(false);
    }
    
    if (target.scrollTop > 100) {
      setShowScrollHint(false);
    }
  };

  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-[45vh] overflow-y-auto px-6 py-4"
          >
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {content.split("\n").map((line, i) => {
                if (line.startsWith("# ")) {
                  return (
                    <h1 key={i} className="text-xl font-bold mt-0 mb-4">
                      {line.replace("# ", "")}
                    </h1>
                  );
                }
                if (line.startsWith("## ")) {
                  return (
                    <h2 key={i} className="text-base font-semibold mt-6 mb-2 text-foreground">
                      {line.replace("## ", "")}
                    </h2>
                  );
                }
                if (line.startsWith("### ")) {
                  return (
                    <h3 key={i} className="text-sm font-medium mt-4 mb-1 text-foreground">
                      {line.replace("### ", "")}
                    </h3>
                  );
                }
                if (line.startsWith("- ")) {
                  return (
                    <li key={i} className="text-sm text-muted-foreground ml-4">
                      {line.replace("- ", "")}
                    </li>
                  );
                }
                if (line.trim() === "") {
                  return <div key={i} className="h-2" />;
                }
                return (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Scroll hint overlay */}
          <AnimatePresence>
            {showScrollHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none flex items-end justify-center pb-2"
              >
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Scroll to read all</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border shrink-0 space-y-3">
          {!hasScrolledToBottom && (
            <p className="text-xs text-muted-foreground text-center">
              Please scroll to the bottom to accept
            </p>
          )}
          
          <Button
            onClick={handleAccept}
            disabled={!hasScrolledToBottom}
            className={cn(
              "w-full gap-2 transition-all",
              hasScrolledToBottom && "bg-success hover:bg-success/90"
            )}
          >
            {hasScrolledToBottom ? (
              <>
                <Check className="w-4 h-4" />
                I Accept
              </>
            ) : (
              "Read to Accept"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
