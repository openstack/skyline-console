.. _reviewing-skyline-console:

Code Reviews
============

Skyline Console follows the same `Review guidelines`_ outlined by the
OpenStack community. This page provides additional information that is
helpful for reviewers of patches to Skyline Console.

Gerrit
------

Skyline Console uses the `Gerrit`_ tool to review proposed code changes.
The review site is https://review.opendev.org

Gerrit is a complete replacement for Github pull requests. `All Github pull
requests to the Skyline Console repository will be ignored`.

See `Quick Reference`_ for information on quick reference for developers.
See `Getting Started`_ for information on how to get started using Gerrit.
See `Development Workflow`_ for more detailed information on how to work with
Gerrit.

The Great Change
----------------

Skyline Console has a modern technology stack and ecology, is easier for
developers to maintain and operate by users, and has higher concurrency
performance. And it focus on functional design and user experience. Embrace
modern browser technology and ecology: React, Ant Design and Mobx. Use React
component to process rendering, the page display process is fast and smooth,
bringing users a better UI and UE experience.

Unit Tests
----------

Skyline Console requires unit tests with all patches that introduce a new
branch or function in the code.  Changes that do not come with a
unit test change should be considered closely and usually returned
to the submitter with a request for the addition of unit test.

CI Job rechecks
---------------

CI job runs may result in false negatives for a considerable number of causes:

- Network failures.
- Not enough resources on the job runner.
- Storage timeouts caused by the array running nightly maintenance jobs.
- External service failure: pypi, package repositories, etc.
- Non skyline-console components spurious bugs.

And the list goes on and on.

When we detect one of these cases the normal procedure is to run a recheck
writing a comment with ``recheck`` for core Zuul jobs.

These false negative have periods of time where they spike, for example when
there are spurious failures, and a lot of rechecks are necessary until a valid
result is posted by the CI job.  And it's in these periods of time where people
acquire the tendency to blindly issue rechecks without looking at the errors
reported by the jobs.

When these blind checks happen on real patch failures or with external services
that are going to be out for a while, they lead to wasted resources as well as
longer result times for patches in other projects.

The Skyline community has noticed this tendency and wants to fix it, so now
it is strongly encouraged to avoid issuing naked rechecks and instead issue
them with additional information to indicate that we have looked at the failure
and confirmed it is unrelated to the patch.

Efficient Review Guidelines
---------------------------

This section will guide you through the best practices you can follow to do
quality code reviews:

* **Failing Gate**: You can look for possible failures in linting, unit test,
  functional test etc and provide feedback on fixing it. Usually it's the
  author's responsibility to do a local run of tox and ensure they don't
  fail upstream but if something is failing on gate and the author is not
  be aware about how to fix it then we can provide valuable guidance on it.

* **Documentation**: Check whether the patch proposed requires documentation
  or not and ensure the proper documentation is added. If the proper
  documentation is added then the next step is to check the status of docs job
  if it's failing or passing. If it passes, you can check how it looks in HTML
  as follows:
  Go to ``openstack-tox-docs job`` link -> ``View Log`` -> ``docs`` and go to
  the appropriate section for which the documentation is added.
  Rendering: We do have a job for checking failures related to document
  changes proposed (openstack-tox-docs) but we need to be aware that even if
  a document change passes all the syntactical rules, it still might not be
  logically correct i.e. after rendering it could be possible that the bullet
  points are not under the desired section or the spacing and indentation is
  not as desired. It is always good to check the final document after rendering
  in the docs job which might yield possible logical errors.

* **Readability**: Readability is a big factor as remembering the logic of
  every code path is not feasible and contributors change from time to time.
  We should adapt to writing readable code which is easy to follow and can be
  understood by anyone having knowledge about JavaScript and working of
  Skyline Console. Sometimes it happens that a logic can only be written in
  a complex way, in that case, it's always good practice to add a comment
  describing the functionality. So, if a logic proposed is not readable, do
  ask/suggest a more readable version of it and if that's not feasible then
  asking for a comment that would explain it is also a valid review point.

* **Downvoting reason**: It often happens that the reviewer adds a bunch of
  comments some of which they would like to be addressed (blocking) and some
  of them are good to have but not a hard requirement (non-blocking). It's a
  good practice for the reviewer to mention for which comments is the -1 valid
  so to make sure they are always addressed.

* **Testing**: Always check if the patch adds the associated unit, functional
  and e2e tests depending on the change.

* **Commit Message**: There are few things that we should make sure the commit
  message includes:

  1) Make sure the author clearly explains in the commit message why the
  code changes are necessary and how exactly the code changes fix the
  issue.

  2) It should have the appropriate tags (Eg: Closes-Bug, Related-Bug,
  Blueprint, Depends-On etc). For detailed information refer to
  `external references in commit message`_.

  3) It should follow the guidelines of commit message length i.e.
  50 characters for the summary line and 72 characters for the description.
  More information can be found at `Summary of Git commit message structure`_.

  4) Sometimes it happens that the author updates the code but forgets to
  update the commit message leaving the commit describing the old changes.
  Verify that the commit message is updated as per code changes.

* **Release Notes**: There are different cases where a releasenote is required
  like fixing a bug, adding a feature, changing areas affecting upgrade etc.
  You can refer to the `Release notes`_ section in our contributor docs for
  more information.

* **Ways of reviewing**: There are various ways you can go about reviewing a
  patch, following are some of the standard ways you can follow to provide
  valuable feedback on the patch:

  1) Testing it in local environment: The easiest way to check the correctness
  of a code change proposed is to reproduce the issue (steps should be in
  launchpad bug) and try the same steps after applying the patch to your
  environment and see if the provided code changes fix the issue.
  You can also go a little further to think of possible corner cases where an
  end user might possibly face issues again and provide the same feedback to
  cover those cases in the original change proposed.

  2) Optimization: If you're not aware about the code path the patch is fixing,
  you can still go ahead and provide valuable feedback about the python code
  if that can be optimized to improve maintainability or performance.

.. _Review guidelines: https://docs.openstack.org/doc-contrib-guide/docs-review-guidelines.html
.. _Gerrit: https://review.opendev.org/q/project:openstack/skyline-apiserver+status:open
.. _Quick Reference: https://docs.openstack.org/infra/manual/developers.html#quick-reference
.. _Getting Started: https://docs.openstack.org/infra/manual/developers.html#getting-started
.. _Development Workflow: https://docs.openstack.org/infra/manual/developers.html#development-workflow
.. _external references in commit message: https://wiki.openstack.org/wiki/GitCommitMessages#Including_external_references
.. _Summary of Git commit message structure: https://wiki.openstack.org/wiki/GitCommitMessages#Summary_of_Git_commit_message_structure
.. _Release notes: https://docs.openstack.org/skyline-apiserver/latest/contributor/releasenotes.html
