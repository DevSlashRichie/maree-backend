Use Case No. 10
Number: UC10
Name: Redeem Loyalty Rewards
Description: The authenticated customer can redeem accumulated loyalty points for available rewards offered by the restaurant.
Actor(s): Customer
Preconditions:
The user must be logged into the system. The user must have an active loyalty account with sufficient points for the selected reward.
Postconditions:
The customer's loyalty points are deducted, the reward is applied, and a redemption record is created.
Special Requirements: None
Extension Points: None

### **Flow: Redeem Loyalty Rewards**

1. **Start**
2. Customer navigates to rewards section
3. System validates authentication token
4. System retrieves customer loyalty account and points balance
5. System retrieves available rewards 
6. System displays rewards list with required points
7. Customer selects a reward to redeem
8. System validates sufficient points balance
9. System validates reward availability
10. System displays redemption confirmation with details
11. Customer confirms redemption
12. System deducts points from loyalty account
13. System grants reward to customer
14. System creates redemption record
15. System updates loyalty account balance
16. System displays redemption confirmation
17. **End**

---

### **Optional Alternative**

**A1: Insufficient Points**

* At step 8:

  * If points balance is below required amount:

    * System displays "Insufficient points" message
    * System shows current balance and points needed
    * End flow

**A2: Reward Unavailable**

* At step 9:

  * If reward is out of stock or no longer available:

    * System displays "Reward no longer available" message
    * System refreshes rewards list
    * Resume flow at step 6

**A3: Database Transaction Error**

* At step 12 or 13:

  * If transaction fails:

    * System rolls back all changes
    * System displays error message
    * Option to retry
    * End flow

**A4: User Cancels Redemption**

* At step 11:

  * If customer cancels:

    * System discards redemption
    * End flow
