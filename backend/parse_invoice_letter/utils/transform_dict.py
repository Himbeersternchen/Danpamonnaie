def invert_dict(d: dict, dim: int) -> dict:
    """Return a new dictionary with keys and values swapped."""
    if dim == 1:
        return {v: k for k, v in d.items()}
    else:
        inverted_d = {}
        for k, v in d.items():
            inverted_d_value = {}
            for k2, v2 in v.items():
                inverted_d_value[v2] = k2
                inverted_d[k] = inverted_d_value
        return inverted_d
