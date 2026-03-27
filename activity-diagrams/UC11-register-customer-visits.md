Use Case No. 11
Number: UC11
Name: Register Customer Visits
Description: The system or authorized staff member registers a customer visit to the restaurant, tracking visits for loyalty program engagement and analytics.
Actor(s): Cashier, Waiter, Customer 
Preconditions:
The system must be operational. The customer must have a registered account (for tracking purposes). The restaurant must be open.
Postconditions:
A visit record is created and associated with the customer's account for loyalty tracking and analytics.
Special Requirements: None
Extension Points: None

### **Flow: Register Customer Visits**

1. **Start**
2. Staff member or customer accesses visit registration
3. System validates authentication token
4. System displays customer search or identification interface
5. Staff member searches for customer by:

   * Email
   * Phone number
   * Loyalty card ID
6. System retrieves matching customer records
7. Staff member selects the correct customer
8. System displays customer profile
9. Staff member confirms visit registration
10. System creates visit record with:

    * Customer ID
    * Branch ID
    * Timestamp
11. System updates customer visit count
12. System updates loyalty program engagement metrics
13. System displays confirmation message
14. **End**

---

### **Optional Alternative**

**A1: Customer Not Found**

* At step 6:

  * If no matching customer records found:

    * System displays "Customer not found" message
    * Option to register a new customer
    * End flow

**A2: Duplicate Visit Registration**

* At step 9:

  * If customer already has a visit registered for the current day:

    * System displays "Visit already registered today" warning
    * Staff member can confirm duplicate or cancel
    * If confirm -> resume flow at step 10
    * If cancel -> end flow

**A3: Invalid Session**

* At step 3:

  * If token is invalid:

    * System redirects to login
    * End flow
