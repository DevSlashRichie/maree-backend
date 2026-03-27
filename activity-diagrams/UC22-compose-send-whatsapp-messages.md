Use Case No. 22
Number: UC22
Name: Compose and Send WhatsApp Messages
Description: The system or authorized staff can compose and send WhatsApp messages to customers for order notifications, promotions, or customer service communications.
Actor(s): Administrator, Supervisor
Preconditions:
The system must be operational with WhatsApp integration configured. The customer must have a valid phone number and WhatsApp opt-in.
Postconditions:
The WhatsApp message is sent to the customer and a delivery record is created.
Special Requirements: None
Extension Points: None

### **Flow: Compose and Send WhatsApp Messages**

1. **Start**
2. Staff member navigates to communication center
3. System validates authentication token and role
4. System displays message composition interface
5. Staff member selects recipient(s):

   * Individual customer
   * Customer segment
   * Order-related notification
6. System retrieves customer phone numbers
7. Staff member composes message:

   * Message template (optional)
   * Custom text
   * Media attachments (optional)
8. System validates message content
9. System checks WhatsApp compliance rules
10. System displays message preview
11. Staff member confirms and sends
12. System queues message for delivery
13. System sends message via WhatsApp API
14. System records delivery status
15. System displays confirmation with delivery status
16. **End**

---

### **Optional Alternative**

**A1: Unauthorized Access**

* At step 3:

  * If user lacks required privileges:

    * System displays "Access denied" message
    * System redirects to home page
    * End flow

**A2: No Valid Phone Numbers**

* At step 6:

  * If recipient has no valid phone number or WhatsApp opt-in:

    * System displays warning about invalid recipients
    * Staff member can remove invalid recipients or cancel
    * Resume flow at step 5 or end flow

**A3: Message Validation Error**

* At step 8:

  * If message content violates policies:

    * System displays validation error messages
    * Staff member must modify message
    * Resume flow at step 7

**A4: WhatsApp API Error**

* At step 13:

  * If sending fails:

    * System displays error message
    * Option to retry
    * System logs failure
    * End flow

**A5: Cancel Message**

* At step 11:

  * If staff member cancels:

    * System discards message
    * End flow
