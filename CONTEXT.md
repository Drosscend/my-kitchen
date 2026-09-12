# Mon Garde-Manger domain

This glossary defines the domain language of the application.

## Identity

**User**:
A person who owns an account, identified by a confirmed e-mail address. Everything else in the application belongs to one user.

**E-mail verification token**:
A single use, hashed token mailed as a link to the address a user must confirm, either at signup or when changing address. The address becomes the account address once the link is opened.

**Password reset token**:
A single use, hashed token mailed as a link to a user who forgot their password. Changing the password revokes it.
