from gradio_client import Client
import sys
for sp in sys.argv[1:]:
    try:
        c = Client(sp, verbose=False)
        print("OK", sp)
        info = c.view_api(return_format="dict", print_info=False)
        print(list(info["named_endpoints"].keys()))
    except Exception as e:
        print("FAIL", sp, repr(e)[:200])
