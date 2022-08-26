.. _release-notes:

Release notes
=============

The release notes for a patch should be included in the patch.

If the following applies to the patch, a release note is required:

* Upgrades

  * The deployer needs to take an action when upgrading
  * A new config option is added that the deployer should consider changing
    from the default
  * A configuration option is deprecated or removed

* Features

  * A new feature is implemented
  * Feature is deprecated or removed
  * Current behavior is changed

* Bugs

  * A security bug is fixed
  * A long-standing or important bug is fixed

* APIs

  * REST API changes


Reviewing release note content
------------------------------

Release notes are user facing.  We expect operators to read them (and other
people interested in seeing what's in a new release may read them, too).
This makes a release note different from a commit message, which is aimed
at other developers.

Keep this in mind as you review a release note.  Also, since it's user
facing, something you would think of as a nit in a code comment (for
example, bad punctuation or a misspelled word) is not really a nit in a
release note--it's something that needs to be corrected.  This also applies
to the format of the release note, which should follow the standards set
out later in this document.

In summary, don't feel bad about giving a -1 for a nit in a release note.  We
don't want to have to go back and fix typos later, especially for a bugfix
that's likely to be backported, which would require squashing the typo fix into
the backport patch (which is something that's easy to forget).  Thus we really
want to get release notes right the first time.

Fixing a release note
---------------------

Of course, even with careful writing and reviewing, a mistake can slip
through that isn't noticed until after a release.  If that happens, the
patch to correct a release note must be proposed *directly to the stable branch
in which the release note was introduced*.  (Yes, this is completely different
from how we handle bugs.)

This is because of how reno scans release notes and determines what release
they go with.  See `Updating Stable Branch Release Notes
<https://docs.openstack.org/reno/latest/user/usage.html#updating-stable-branch-release-notes>`_
in the `reno User Guide` for more information.

Bugs
----

For bug fixes, release notes must include the bug number in Launchpad with a
link to it as a RST link.

Note the use of the past tense ("Fixed") instead of the present tense
("Fix").  This is because although you are fixing the bug right now in the
present, operators will be reading the release notes in the future (at the
time of the release), at which time your bug fix will be a thing of the past.

Additionally, keep in mind that when your release note is published, it is
mixed in with all the other release notes and won't obviously be connected
to your patch.  Thus, in order for it to make sense, you may need to repeat
information that you already have in your commit message.  That's OK.

Creating the note
-----------------

Skyline Console uses `reno <https://docs.openstack.org/reno/latest/>`_ to
generate release notes. Please read the docs for details. In summary, use

.. code-block:: bash

  $ tox -e venv -- reno new <bug-,bp-,whatever>

Then edit the sample file that was created and push it with your change.

To see the results:

.. code-block:: bash

  $ git commit  # Commit the change because reno scans git log.

  $ tox -e releasenotes

Then look at the generated release notes files in releasenotes/build/html in
your favorite browser.
