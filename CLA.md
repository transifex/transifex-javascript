# Contributor License Agreement

Thank you for your interest in contributing to Transifex. This page describes the established guidelines for contributions of code, documentation, patches, and artwork to Transifex.

In order to clarify the intellectual property license granted with contributions from any person or entity, Transifex, as maintainer of Transifex, must have a Contributor License Agreement (CLA) on file that has been signed by each Contributor, indicating agreement to certain license terms. This license is not only for the protection of the contributors themselves, but also for the protection of the project and its users; it does not change your rights to use your own Contributions for any other purpose.

All past and future contributors of non-trivial amounts of code (more than just a line or two) to Transifex are required to sign the CLA. If somebody is unable to sign the document, their contribution will be removed from Transifex.


# Electronically sign the CLA using GPG

1. If you don't have a GPG key already, create one and publish it::

    gpg --gen-key
    gpg --list-secret-keys
    # Publish your key: Replace the 8-digit ID with your key ID.
    gpg --send-keys --keyserver pgp.mit.edu A1C02C1A

2. Open the :ref:`Contributor License Agreement <cla-text>`. Copy/download the
   CLA content to a local file on your workstation (eg. ``transifex-cla.txt``)
   and fill in the necessary information using your favorite text
   editor (eg. vim, gedit, Notepad).

3. Digitally sign the file using GPG, either with your favorite GUI (eg. seahorse, kgpg) or using the command-line::

    gpg --clearsign transifex-cla.txt

4. Send the resulting file `transifex-cla.txt.gpg` by email to admin -at- transifex -dot- com.


# Questions

Transifex's CLA is a copy of the one used by Sun Microsystems for all contributions to their projects. This particular agreement has been used by other software projects in addition to Sun and is generally accepted as reasonable within the Open Source community.

## Why is a signed CLA required?

The license agreement is a legal document in which you state you are entitled to contribute the code/documentation/translation to Transifex and are willing to have it used in distributions and derivative works. This means that should there be any kind of legal issue in the future as to the origins and ownership of any particular piece of code, Transifex has the necessary forms on file from the contributor(s) saying they were permitted to make this contribution.

The CLA also ensures that once you have provided a contribution, you cannot try to withdraw permission for its use at a later date. People and companies can therefore use Transifex, confident that they will not be asked to stop using pieces of the code at a later date.

Being able to make a clear statement about the origins of the code is very important as Transifex is adopted by large organizations who are necessarily cautious about adopting products with unknown origins. We wish for Transifex to be used and distributed as widely as possible and in order to do this with confidence, we need to be sure about the origins and continuing existence of the code.


## Can I withdraw permission to use my contributions at a later date?

No. This is one of the reasons we require a CLA. No individual contributor can hold such a threat over the entire community of users. Once you make a contribution, you are saying we can use that piece of code forever.

Trivial patches like spelling fixes or missing words in the documentation won't require an agreement, since anybody could do those. However, almost anything will require a CLA.


## This info was very helpful! Did you guys write it on your own?

As usual, a great deal of awesome things come by standing on the shoulders of giants. In this case it was, once again, Django. They've got an excellent CLA page, which we based our own page on (read: ripped off).
