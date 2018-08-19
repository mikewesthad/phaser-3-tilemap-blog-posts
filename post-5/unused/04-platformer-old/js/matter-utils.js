// If a body is a compound body (like some of our tile bodies), then Matter collision events may
// be triggered by any of the parts of the compound body. The root body is the one which has access
// to the tile, gameObject and label.
export function getRootBody(body) {
  while (body.parent !== body) body = body.parent;
  return body;
}
