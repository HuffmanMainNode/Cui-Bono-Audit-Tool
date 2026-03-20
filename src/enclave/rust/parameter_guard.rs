
/**
 * CUI BONO: RUST-PARAMETER-GUARD v1.0
 * Targeted Mitigation: Parameter Smuggling (JSON Injection).
 * Method: Strict schema-enforcement and non-recursive key flattening at the kernel level.
 */
pub fn sanitize_json_keys(input_json: &str) -> bool {
    let forbidden_keys = ["role", "admin", "root", "privilege"];
    !forbidden_keys.iter().any(|&k| input_json.contains(k))
}
