const form = $(".main-form");
const textInp = $("#textInp");
const signatureOutput = $("#signatureOutput");
const verifyBtn = $("#verifyBtn");
const valid = $("#validation");
const generateBtn = $("#generateBtn");
const alert = $(".alert");

$(document).ready(() => {
    form.on("submit", function (event) {
        verifyBtn.prop("disabled", true);
        alert
            .removeClass("alert-warning alert-success show")
            .addClass("visually-hidden");
        event.preventDefault();
        let text = textInp.val();
        // console.log(text);
        const data = new TextEncoder().encode(text);

        crypto.subtle
            .generateKey(
                {
                    name: "RSA-PSS",
                    modulusLength: 4096,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: { name: "SHA-256" },
                },
                true,
                ["sign", "verify"]
            )
            .then((keyPair) => {
                crypto.subtle
                    .sign(
                        {
                            name: "RSA-PSS",
                            saltLength: 32,
                        },
                        keyPair.privateKey,
                        data
                    )
                    .then((signature) => {
                        const signatureHex = Array.from(
                            new Uint8Array(signature)
                        )
                            .map((b) => b.toString(16).padStart(2, "0"))
                            .join("");
                        signatureOutput.val(signatureHex);
                        verifyBtn.prop("disabled", false);
                        verifyBtn.on("click", () => {
                            let signatureHex = signatureOutput.val();
                            let signature = new Uint8Array(
                                signatureHex
                                    .match(/.{1,2}/g)
                                    .map((byte) => parseInt(byte, 16))
                            );
                            crypto.subtle
                                .verify(
                                    {
                                        name: "RSA-PSS",
                                        saltLength: 32,
                                    },
                                    keyPair.publicKey,
                                    signature,
                                    data
                                )
                                .then((isValid) => {
                                    if (isValid) {
                                        alert
                                            .removeClass(
                                                "visually-hidden alert-warning"
                                            )
                                            .addClass("show alert-success");
                                        alert.html(
                                            "<strong>Success</strong><br>Signature is valid"
                                        );
                                    } else {
                                        alert
                                            .removeClass(
                                                "visually-hidden alert-success"
                                            )
                                            .addClass("show alert-warning");
                                        alert.html(
                                            "<strong>Warning</strong><br>Signature is invalid"
                                        );
                                    }
                                });
                        });
                    });
            });
    });
});
