# Data Types

## Object:-

Everything is object in python.

every object will have:-

- unique identity
- unique type
- have some value

## Mutable and immutable:-

mutable means it can be changable
immutable meand it could not be changable

that identity of the object decides which object gonna to change and which are not.

In the world of mutable python always create a new object and change the refrence not the value
you can chekcout this by id() method:-

```Python

sugar_amount = 2
print(f"Initial sugar: {sugar_amount}")
sugar_amount = 22
print(f"Second sugar:{sugar_amount}")

print(f"id of 2: {id(2)}")
print(f"id of 22:{id(22)}")
```

mutability

```Python

## mutable

spice_mix = set()
print(f"Initial spice mix: {id(spice_mix)}")

spice_mix.add("cumin")
print(f"After adding cumin: {id(spice_mix)}")

```

# Numbers:-
 it includes
 - integers
 - boolean
 - real numbers
 - complex number
 
