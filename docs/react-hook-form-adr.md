# ADR: react-hook-form

## Problem
It was difficult to create controlled and uncontrolled forms and easily keep an object of the form values.

## Possible solutions
### Use a custom-rolled function that reads form values
This is annoying because it requires iterating all the known form values and type checking was hard.

### Rely on react-hook-form
This library provides custom hooks that control form values. It also supports custom types via type scripts for all the form values.

## Chosen Solution
I started using react-hook-form for the main time entry form. It let me eliminate the code that iterated form input names to construct an object.
