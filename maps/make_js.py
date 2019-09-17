from glob import glob
import json

with open('../js/maps.js', 'w') as maps:

    maps.write("var Maps = [\n")

    for m in glob('./*.json'):
        with open(m, 'r') as f:
            data = json.load(f)
            m = '/maps' + m[1:]
            maps.write("\t{")
            for key in data:
                if key == 'way': # old name
                    maps.write("compass: {}, ".format(data[key]))
                elif str.isdigit(str(data[key])) or key == 'tiles':
                    maps.write("{}: {}, ".format(key, data[key]))
                else:
                    maps.write("{}: '{}', ".format(key, data[key]))
            maps.write("file: '{}'".format(m))
            maps.write("},\n")

    maps.write("];\nexport {Maps};")
