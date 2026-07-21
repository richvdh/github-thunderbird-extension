# Releasing github-review-context

1. Replace the "UNRELEASED" heading in `CHANGELOG.md` with the new version
   number, start a new (empty) "UNRELEASED" section, and commit your changes.

2. Run `pnpm version -m "v%s" <version>`, where `<version>` is your desired new
   version. You can use `major`/`minor`/`patch` as a shorthand.. This will
   automatically update `package.json`, commit, then create a tag.

3. Push the changes and tag:
   ```
   git push
   git push --tags
   ```

   Pushing the tag will trigger a build on Github actions.

4. Open the release at
   https://github.com/richvdh/github-thunderbird-extension/releases. Update the
   release notes and publish.

5. Download the xpi and source tarball from the release. (NB "Save link as" to
   stop Firefox blocking the download.)

6. Visit
   https://addons.thunderbird.net/en-US/developers/addon/github-review-context/versions/submit/
   and upload the new version.

7. Edit the version at
   https://addons.thunderbird.net/en-US/developers/addon/github-review-context/versions
   to add some "Version Notes". Do `markdown-it CHANGELOG.md` to produce some
   HTML to paste in, though avoid `<h3>` tags, which don't work.
