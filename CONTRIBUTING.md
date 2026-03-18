# Contributing to CISB Referral Application

## How to Contribute

Government employees, public and members of the private sector are encouraged to contribute to the repository by forking and submitting a pull request.

(If you are new to GitHub, you might start with a [basic tutorial](https://help.github.com/articles/set-up-git) and check out a [more detailed guide to pull requests](https://help.github.com/articles/using-pull-requests/).)

Pull requests will be evaluated by the repository guardians on a schedule and if deemed beneficial will be committed to the main branch.

## Getting Started

See the [README](README.md) for prerequisites, installation, and development setup instructions.

## Development Workflow

1. Fork the repository and clone your fork locally
2. Install dependencies: `npm run install:all`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes and test them
5. Ensure tests pass before submitting
6. Commit using [Conventional Commits](https://www.conventionalcommits.org/) format
7. Push to your fork and submit a pull request

## Pull Request Guidelines

- Use [Conventional Commits](https://www.conventionalcommits.org/) format for PR titles (e.g., `feat: add user authentication`, `fix: resolve form validation issue`)
- Provide a clear description of the changes in the PR body
- Include tests for new functionality
- Ensure all tests pass
- Follow the existing code style and formatting
- Update documentation as needed
- Reference any related issues in the PR description

## Security

- Never commit credentials or secrets
- Use environment variables for sensitive configuration
- Follow BC Government security standards
- Validate all user inputs on both client and server

## License

All contributors retain the original copyright to their stuff, but by contributing to this project, you grant a world-wide, royalty-free, perpetual, irrevocable, non-exclusive, transferable license to all users under the terms of the [Apache License 2.0](LICENSE) under which this project is distributed.
