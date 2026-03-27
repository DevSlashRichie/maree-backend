Use Case No. 31
Number: UC31
Name: Send Feedback and Reviews
Description: The authenticated customer can submit feedback and reviews about their dining experience, food quality, service, and overall satisfaction.
Actor(s): Customer
Preconditions:
The user must be logged into the system with a valid authenticated session. The customer should have a completed order to review.
Postconditions:
The feedback/review is submitted and stored in the system for moderation and analytics.
Special Requirements: None
Extension Points: None

### **Flow: Send Feedback and Reviews**

1. **Start**
2. Customer navigates to feedback/review section
3. System validates authentication token
4. System retrieves customer's recent orders (optional)
5. System displays feedback form:

   * Overall rating (1-5 stars)
   * Food quality rating
   * Service rating
   * Written review
   * Order reference (optional)
6. Customer fills in feedback details
7. System validates input fields
8. System displays feedback preview
9. Customer confirms submission
10. System saves feedback to database
11. System sets moderation status (pending)
12. System logs submission
13. System displays confirmation message
14. **End**

---

### **Optional Alternative**

**A1: Invalid Session Token**

* At step 3:

  * If token is invalid:

    * System redirects to login
    * End flow

**A2: Invalid Input**

* At step 7:

  * If validation fails:

    * System displays validation error messages
    * Customer must correct input
    * Resume flow at step 6

**A3: Duplicate Review**

* At step 10:

  * If customer already reviewed the same order:

    * System displays "Review already submitted for this order" message
    * Option to edit existing review
    * End flow

**A4: Cancel Submission**

* At step 9:

  * If customer cancels:

    * System discards feedback
    * End flow

**A5: Database Save Error**

* At step 10:

  * If save operation fails:

    * System displays error message
    * Option to retry
    * End flow
