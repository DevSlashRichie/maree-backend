Use Case No. 30
Number: UC30
Name: Consult the History of Redeemed Rewards
Description: The authenticated customer can view the history of rewards they have redeemed using their loyalty points.
Actor(s): Customer
Preconditions:
The user must be logged into the system with a valid authenticated session. The user must have an active loyalty account.
Postconditions:
The system displays the customer's reward redemption history with details including dates, rewards, and points spent.
Special Requirements: None
Extension Points: None

### **Flow: Consult the History of Redeemed Rewards**

1. **Start**
2. Customer navigates to loyalty section
3. System validates authentication token
4. System retrieves customer loyalty account
5. System displays redemption history filters:

   * Date range
   * Reward type
   * Redemption status
6. Customer configures filters (optional)
7. System validates filter parameters
8. System retrieves redemption history from database
9. System applies filters and sorting
10. System returns redemption history data
11. System renders redemption history interface
12. Customer views redeemed rewards with details
13. **End**

---

### **Optional Alternative**

**A1: Invalid Session Token**

* At step 3:

  * If token is invalid:

    * System redirects to login
    * End flow

**A2: No Loyalty Account**

* At step 4:

  * If customer has no loyalty account:

    * System displays "No loyalty account found" message
    * System prompts to create a loyalty account
    * End flow

**A3: Invalid Filter Parameters**

* At step 7:

  * If filter parameters are invalid:

    * System displays validation error messages
    * Customer must correct filters
    * Resume flow at step 5

**A4: No Redemption History**

* At step 8 or 9:

  * If no redemptions found:

    * System displays "No redemption history" message
    * End flow

**A5: Backend Error**

* At step 8:

  * If request fails:

    * System displays error message
    * Option to retry
    * End flow
