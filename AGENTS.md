# Adhere strictly to these codebase structure rules:
    1. STRICT LIMIT: Maximum 200 lines per file.
    2. STRUCTURE: Split code logically into frontend/, backend/, features/, components/, hooks/, libs/, and shared/ etc...
    3. MODULARITY: Enforce the Single Responsibility Principle. Extract types, constants, and helper functions into separate files.
    4. MOBILE-FIRST: Design for mobile first, then scale up to desktop.
    
# Code Documentation Protocol
    All code must be commented inline. Comments explain the *what* and *why*, not the obvious.
    
    Required
    - Every function needs a description with its parameters and return values
    - Complex logic, business rules, and edge cases must be explained
    - Comment every 3-5 lines in dense or non-obvious sections
    
    Avoid
    - Commenting self-evident code (i++ doesn't need a comment)
    - Comments that just restate what the code literally does
    - Using comments to excuse bad code — refactor instead
        