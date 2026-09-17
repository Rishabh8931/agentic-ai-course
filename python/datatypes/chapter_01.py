sugar_amount = 2
print(f"Initial sugar: {sugar_amount}")
sugar_amount = 22
print(f"Second sugar:{sugar_amount}")

print(f"id of 2: {id(2)}")
print(f"id of 22:{id(22)}")

## mutable

spice_mix = set()
print(f"Initial spice mix: {id(spice_mix)}")

spice_mix.add("cumin")
print(f"After adding cumin: {id(spice_mix)}")