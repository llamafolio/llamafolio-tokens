#

This is to test the npm package and making sure it works as expected.

The dependency is a tarball, generated from the `npm pack` command. in root:

**1**

```sh
npm pack --pack-destionation test/app
```

**2**

Then, in `test/app`:

```sh
npm install
```

**3**

Then, also in `test/app`:

```sh
node --test
```

When making changes to the package, the steps must be repeated otherwise you will be testing against the old version.
