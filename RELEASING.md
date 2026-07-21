# Releasing github-review-context

1. Replace the "UNRELEASED" heading in `CHANGELOG.md` with the new version
   number, start a new (empty) "UNRELEASED" section, and commit your changes.

2. Run `pnpm version -m "v%s" <version>`, where `<version>` is your desired new
   version. You can use `major`/`minor`/`patch` as a shorthand.. This will
   automatically update `package.json`, commit, then create a tag.

3. Open the release at
   https://github.com/richvdh/github-thunderbird-extension/releases. Update the
   release notes and publish.
