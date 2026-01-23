# Contributing to Cyborg

Cyborg is an AI translation language for sending Windows messages using
hex‑string semantics. Contributions must preserve clarity, determinism,
and machine‑readability across the entire messaging protocol.

## Development Guidelines

1. **AIFVS-ARTIFACT Headers**  
   All source files must include the `AIFVS-ARTIFACT` header for AI visibility.

2. **Hex Messaging Law**  
   No ambiguous or non‑deterministic hex patterns may be introduced.

3. **Windows Messaging Integrity**  
   All new opcodes or translation rules must be validated against the
   Cyborg Windows messaging layer.

## How to Submit

- Fork the repository  
- Create a feature branch (`git checkout -b feature/Cyborg-Enhancement`)  
- Submit a Pull Request describing the protocol improvement  

*Cyborg Law: Every message must be readable by both machine and mind.*
