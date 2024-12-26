<h1>PowerBot</h1>

<h3>A Microsoft Teams chatbot with a Mobile Punchcard solution built into it</h3>



Use the /punch command to generate an adaptive card

<img width="440" alt="image" src="https://github.com/user-attachments/assets/b59944b6-f645-4237-a74e-4d96c6fb8425" />



This adative card grabs the users Microsoft 365 credentials to query a Mongo DB server for their relevant schedule (Run) information.

This scheduling information is sent out daily from a FileMaker Server to a Mongo DB server used as a cache.

The user is then given scheduling options in the drop down list to select which schedule they are to punch into.  If there is only one schedule associated with that user, then it is chosen by default

There is also a notes field for cases where they are unscheduled or late.




When a user hits the punch button their location is requested

 <img width="245" alt="image" src="https://github.com/user-attachments/assets/2bb7c713-d410-475a-b40f-2a8c0ed7df78" />



It is then sent to a Mongo DB server cache and later pulled into the Filemaker Server. 




Upon punching in/out, the user is sent a card summarizing their punch information.

<img width="360" alt="image" src="https://github.com/user-attachments/assets/c9229ca0-0a0f-4ae7-af47-fd9a1b05ea57" />
