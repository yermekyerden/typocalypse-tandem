# Date: 2026-03-01

## Done

I am still working on the login/registration form using shadcn and React. I added main shadsn components for the form, but I haven't implemented them yet.

## Decisions (and explanations)

I decided to use a ready-made `Field` component for the form (No fundamentally new solutions, actually. I continue development in accordance with the strategy we chosed).
We determined the approximate structure of fields for the form:

    interface LoginRequest {
        username: string;
        password: string;
    }

    interface RegisterRequest {
        username: string;
        email: string;
        password: string;
        displayName: string;
    }

## Notes

I need a password re-entry field on the registration page (like in real websites and apps).
I feel like I'm doing everything very poorly and slowly, and I don't feel like I'm making any significant progress (compared to what I knew and could do yesterday/last week).
Throughout the course, I was not allowed to use libraries, frameworks, or neural networks, and now I am having a really hard time getting used to the idea that I don’t have to write absolutely everything from scratch.

## Plan (next steps)

1. Add form fields using shadcn/ui properly
2. Add form fields verification using shadcn/ui
