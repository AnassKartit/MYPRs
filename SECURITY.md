# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | Yes                |

## Security Practices

This extension follows enterprise security best practices:

### Authentication & Authorization
- Uses Azure DevOps SDK OAuth tokens - no credentials stored client-side
- Requests minimum required scopes: `vso.code` (read), `vso.project` (read), `vso.profile` (read)
- All API calls use bearer token authentication via the SDK

### Data Protection
- No sensitive data is stored in local storage or cookies
- Access tokens are managed exclusively by the Azure DevOps SDK
- Error messages are sanitized to prevent token leakage in logs

### Input Validation
- All user inputs are sanitized before rendering (XSS prevention)
- URLs are validated against an allowlist of trusted domains
- Resource names are validated against safe patterns to prevent injection
- Pull request IDs are validated as positive integers

### Content Security
- Content Security Policy restricts resource loading to trusted sources
- `frame-ancestors` directive prevents clickjacking
- External links use `rel="noopener noreferrer"` to prevent reverse tabnapping

### API Security
- Rate limiting prevents excessive API calls (token bucket algorithm)
- API calls are batched to minimize request volume
- Failed requests are handled gracefully without exposing internal details

### Code Quality
- ESLint with security plugin enforces secure coding patterns
- TypeScript strict mode catches type-related bugs at compile time
- No use of `eval()`, `innerHTML`, or other dangerous APIs

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email the maintainers with details of the vulnerability
3. Include steps to reproduce if possible
4. Allow reasonable time for a fix before public disclosure

## Compliance

This extension is designed to meet:
- OWASP Top 10 Web Application Security guidelines
- Azure DevOps Marketplace security requirements
- Enterprise security review standards
