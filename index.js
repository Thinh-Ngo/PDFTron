

let dummy_user = {
    lastname: "Ngo",
    firstname: "Thinh",
    date: "11/09/2020",
    email: "thinhnt@mobile-id.vn",
    job_title: "developer",
    company: "mobile-id",
    initials: "TN",
    config: "config.js"
}

WebViewer({
    path: "WebViewer/lib",
    initialDoc: "sample.txt",
    showLocalFilePicker: true,
    fullAPI: true,
    accessibleMode: true,
    disabledElements: [
        'toolsHeader',
        'ribbons',
        'themeChangeButton',
        'filePickerButton',
        'selectToolButton',
        'searchButton',
        'panToolButton',
        'menuButton',
    ],
    licenseKey: 'Insert commercial license key here after purchase',
}, document.getElementById('viewer'))
    .then(instance => {

        instance.disableElements(['annotationStyleEditButton', 'linkButton']);
        instance.setActiveLeftPanel('notesPanel')

        const { docViewer, Annotations, annotManager, Tools, PDFNet, iframeWindow, CoreControls } = instance;
        const { WidgetFlags } = Annotations;
        const signatureTool = docViewer.getTool(Tools.ToolNames.SIGNATURE);
        const widgetEditingManager = instance.annotManager.getWidgetEditingManager();
        const iframeDoc = iframeWindow.document;
        console.log("iframeDoc: ", iframeDoc)
        instance.openElements(['leftPanel']);

        //**************CREATE MODAL*************//
        //***************************************//
        // var Signaturemodal = {
        //     dataElement: 'signaturedict',
        //     render: function renderCustomModal() {
        //         var div = document.createElement("div");
        //         hr = document.createElement('hr')
        //         btn = document.createElement("BUTTON");
        //         btn.setAttribute("id", "sign");
        //         btn.innerHTML = "SIGN";
        //         div.style.color = 'white';
        //         div.style.backgroundColor = 'blue';
        //         div.style.padding = '20px 40px';
        //         div.style.borderRadius = '10px';
        //         div.innerText = 'SIGNATURE DICTIONARY';
        //         div.appendChild(hr)
        //         div.appendChild(btn)
        //         return div
        //     }
        // }
        // instance.setCustomModal(Signaturemodal)

        // var Mergemodal = {
        //     dataElement: 'mergedoc',
        //     render: function renderCustomModal() {
        //         var div = document.createElement('div');
        //         h1 = document.createElement('h1');
        //         h1.innerHTML = "MERGE ANOTHER DOCUMENT";
        //         input = document.createElement(input);
        //         input.setAttribute("id", "file-picker");
        //         input.setAttribute("type", "file");
        //         input.setAttribute("accept", ".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.pptx,.md");
        //         div.style.backgroundColor = "#fafafa";
        //         div.style.border = "1px solid black";
        //         div.appendChild(h1);
        //         div.appendChild(input);
        //         return div;
        //     }
        // }
        // instance.setCustomModal(Mergemodal)

        //----------- END CREATING--------------//
        //--------------------------------------//

        var myCustomPanel = {
            tab: {
                dataElement: 'Merge Document',
                title: 'Merge Document',
                img: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="18" viewBox="50 0 1500 950"> <path fill="currentColor" d="M899 733q10 7 7 20-3 12-16 12H227q-7 0-10-3L11 611q-10-8-6-19.5T21 580h40l-50-37q-10-7-6-18.5T21 513h638q6 0 10 3l230 151q10 6 7 18t-16 12h-47zm-65-69L654 546H72l160 118h602zm-602 67h601l-52-34H227q-7 0-10-3l-110-81H72zm669-299q14 8 9.5 23T890 470H227q-7 0-13-4L8 315q-13-9-7-23.5T21 277h638q8 0 12 4zm-667-4h586L654 319H85zm342 420q12 10 1 24-4 5-11.5 5.5T554 874l-42-38v155q0 7-5 12t-12 5-12-5-5-12V832l-49 39q-13 11-23.5-2.5T408 845l88-69zm1-685l-87 69-81-72q-5-4-5.5-11t4-12.5T419 131t12 4l39 36V17q0-7 5-12t12-5 12 5 5 12v160l51-40q14-11 24 1.5t-2 24.5z"></path> </svg>',
            },
            panel: {
                dataElement: 'mergeDocument',
                render: function () {
                    var div = document.getElementById('merge_panel');
                    // async function mergeDoc() {
                    //     try {
                    //         console.log('file: ', file)
                    //         const secondDoc = await CoreControls.createDocument(file);
                    //         const pagesToInsert = [4, 5, 6];
                    //         console.log('alo alo ?')
                    //         const pageIndexToInsert = doc.getPageCount() + 1;
                    //         doc.insertPages(secondDoc, pagesToInsert, pageIndexToInsert).then(() => {
                    //             doc.getPageCount(); // 6
                    //         })
                    //     } catch (error) {
                    //         console.log(error)
                    //     }
                    // }
                    return div
                }
            }
        };


        //**********--- SET POPOP OVERLAYS ---*********//
        // instance.setAnnotationContentOverlayHandler(annotation => {
        //     const div = document.createElement('div');
        //     div.appendChild(document.createTextNode(`Created by: ${annotation.Author}`));
        //     div.appendChild(document.createElement('br'));
        //     div.appendChild(document.createTextNode(`Created on ${annotation.DateCreated}`));
        //     return div;
        // });

        //--- END POPOP OVERLAYS ---//

        //*************************************** CREATE DOM *******************************************//
        //**********************************************************************************************//
        // const createInnerElement = Annotations.SignatureWidgetAnnotation.prototype.createInnerElement;
        // console.log('createInnerElement: ', createInnerElement)
        // Annotations.SignatureWidgetAnnotation.prototype.createInnerElement = function () {
        //     var div = document.createElement("div");
        //     div.addEventListener('click', () => {
        //         alert('hello there.')
        //     })
        //     return div;
        // };
        //______________________________________________________________________________________________//

        //*********---- CATCH EVENTS ---********//

        // instance.setHeaderItems(header => {
        //     header.delete(0);
        //     header.get('viewControlsButton').insertBefore({
        //         type: 'spacer'
        //     });
        // });

        docViewer.on('documentLoaded', async () => {
            console.log('document on ?')
            await PDFNet.initialize();
            console.log('*********LOOK HERE BITCH********* ', PDFNet)


            const doc = await docViewer.getDocument().getPDFDoc()
            console.log('DOC: ', doc)

            docViewer.refreshAll();
            // Update viewer with new document
            docViewer.updateView();

            const $body = $("body");
            //*************************************** CATCH EVENT *******************************************//
            //**********************************************************************************************//
            let is_sign = false
            let docbuf = await doc.saveMemoryBuffer(PDFNet.SDFDoc.SaveOptions.e_incremental);

            annotManager.on('annotationSelected', (annotations, action) => {
                if (action === 'selected') {
                    console.log('annotation: ', annotations)
                    if (annotations['0'].w0 === "Sign here" && annotations['0'].ToolName === "AnnotationCreateCallout" && is_sign == true) {
                        instance.openElements(['signatureModal']);
                        signature_holding = annotManager.getSelectedAnnotations()
                        is_sign = false
                    } else if (annotations['0'].G_ === "Sign here" && annotations['0'].ToolName === "AnnotationCreateCallout" && is_sign == false) {
                        is_sign = true
                    } else if (annotations['0'].Subject === "Signature") async () => {
                    }
                } else if (action === 'deselected') {
                    console.log('annotation deselected')
                }
                if (annotations === null && action === 'deselected') {
                    console.log('all annotations deselected');
                    is_sign = true
                }
            });

            signatureTool.on('signatureSaved', async (signatureAnnot) => {
                annotManager.deleteAnnotation(signature_holding)
            });

            signatureTool.on('annotationAdded', async (signatureAnnot) => {
                const copiedSignature = docViewer.getAnnotationManager().getAnnotationCopy(signatureAnnot);
                const dataUrl = await signatureTool.getPreview(copiedSignature);
                await signhere(signatureAnnot.getX(), signatureAnnot.getY());
                annotManager.deleteAnnotation(signatureAnnot);
                await digital_sign('cloudfca.pfx', '12345678', dataUrl, 'Signature');
                is_sign = false;
            });
            //_____________________________________ END CATCH EVENT ______________________________________//

            //***************************************************************************************************//
            //***************************************** CREATE FUNCTION *****************************************//
            //***************************************************************************************************//
            async function print_signature_info() {
                console.log('================================================================================');
                console.log('Reading and printing digital signature information');

                doc.initSecurityHandler();
                doc.lock();
                if (!(await doc.hasSignatures())) {
                    console.log('Doc has no signatures.');
                    console.log('================================================================================');
                    return;
                } else {
                    console.log('Doc has signatures.');
                }

                for (const fitr = await doc.getFieldIteratorBegin(); await fitr.hasNext(); await fitr.next()) {
                    const field = await fitr.current();
                    (await field.isLockedByDigitalSignature()) ? console.log('==========\nField locked by a digital signature') : console.log('==========\nField not locked by a digital signature');

                    console.log('Field name: ' + (await field.getName()));
                    console.log('==========');
                }

                console.log('====================\nNow iterating over digital signatures only.\n====================');

                const digsig_fitr = await doc.getDigitalSignatureFieldIteratorBegin();
                for (; await digsig_fitr.hasNext(); await digsig_fitr.next()) {
                    console.log('==========');
                    const digsigfield = await digsig_fitr.current();
                    console.log('digsigfield: ', digsigfield)
                    console.log('Field name of digital signature: ' + (await (await PDFNet.Field.create(await digsigfield.getSDFObj())).getName()));

                    if (!(await digsigfield.hasCryptographicSignature())) {
                        console.log(
                            'Either digital signature field lacks a digital signature dictionary, ' +
                            'or digital signature dictionary lacks a cryptographic Contents entry. ' +
                            'Digital signature field is not presently considered signed.\n' +
                            '=========='
                        );
                        continue;
                    }

                    const cert_count = await digsigfield.getCertCount();
                    console.log('Cert count: ' + cert_count);
                    for (let i = 0; i < cert_count; i++) {
                        const cert = await digsigfield.getCert(i);
                        console.log('Cert #' + i + ' size: ' + cert.byteLength);
                    }

                    const subfilter = await digsigfield.getSubFilter();

                    console.log('Subfilter type: ' + subfilter);

                    if (subfilter != PDFNet.DigitalSignatureField.SubFilterType.e_ETSI_RFC3161) {
                        console.log("Signature's signer: " + (await digsigfield.getSignatureName()));

                        const signing_time = await digsigfield.getSigningTime();
                        if (await signing_time.isValid()) {
                            console.log('Signing time is valid.');
                        }

                        console.log('Location: ' + await digsigfield.getLocation().toString());
                        console.log('Reason: ' + await digsigfield.getReason().toString());
                        console.log('Contact info: ' + await digsigfield.getContactInfo().toString());
                        console.log('digsig: ', digsigfield.getLocation())
                    } else {
                        console.log('SubFilter == e_ETSI_RFC3161 (DocTimeStamp; no signing info)');
                    }

                    console.log((await digsigfield.hasVisibleAppearance()) ? 'Visible' : 'Not visible');

                    const digsig_doc_perms = await digsigfield.getDocumentPermissions();
                    const locked_fields = await digsigfield.getLockedFields();
                    for (let i = 0; i < locked_fields.length; i++) {
                        console.log('This digital signature locks a field named: ' + locked_fields[i]);
                    }

                    switch (digsig_doc_perms) {
                        case PDFNet.DigitalSignatureField.DocumentPermissions.e_no_changes_allowed:
                            console.log('No changes to the document can be made without invalidating this digital signature.');
                            break;
                        case PDFNet.DigitalSignatureField.DocumentPermissions.e_formfilling_signing_allowed:
                            console.log('Page template instantiation, form filling, and signing digital signatures are allowed without invalidating this digital signature.');
                            break;
                        case PDFNet.DigitalSignatureField.DocumentPermissions.e_annotating_formfilling_signing_allowed:
                            console.log('Annotating, page template instantiation, form filling, and signing digital signatures are allowed without invalidating this digital signature.');
                            break;
                        case PDFNet.DigitalSignatureField.DocumentPermissions.e_unrestricted:
                            console.log('Document not restricted by this digital signature.');
                            break;
                    }
                    console.log('==========');
                }
                console.log('================================================================================');
            }
            const addField = (type, point = {}, value = '', flag = {}) => {
                const { docViewer, Annotations } = instance;
                const annotManager = docViewer.getAnnotationManager();
                const docu = docViewer.getDocument();
                const displayMode = docViewer.getDisplayModeManager().getDisplayMode();
                const page = displayMode.getSelectedPages(point, point);
                if (!!point.x && page.first == null) {
                    return; //don't add field to an invalid page location
                }
                const page_idx = docViewer.getCurrentPage()
                const page_info = docu.getPageInfo(page_idx);
                const page_point = displayMode.windowToPage(point, page_idx);
                const zoom = docViewer.getZoom();

                var textAnnot = new Annotations.FreeTextAnnotation();
                textAnnot.PageNumber = page_idx;
                const rotation = docViewer.getCompleteRotation(page_idx) * 90;
                textAnnot.Rotation = rotation;
                if (rotation === 270 || rotation === 90) {
                    textAnnot.Width = 50.0 / zoom;
                    textAnnot.Height = 250.0 / zoom;
                } else {
                    textAnnot.Width = 250.0 / zoom;
                    textAnnot.Height = 50.0 / zoom;
                }
                textAnnot.X = (page_point.x || page_info.width / 2) - textAnnot.Width / 2;
                textAnnot.Y = (page_point.y || page_info.height / 2) - textAnnot.Height / 2;

                textAnnot.setPadding(new Annotations.Rect(0, 0, 0, 0));
                textAnnot.custom = {
                    type,
                    value,
                    flag,
                };

                // set the type of annot
                textAnnot.setContents('Sign here');
                textAnnot.FontSize = '' + 20.0 / zoom + 'px';
                textAnnot.FillColor = new Annotations.Color(211, 211, 211, 0.5);
                textAnnot.TextColor = new Annotations.Color(0, 165, 228);
                textAnnot.StrokeThickness = 1;
                textAnnot.StrokeColor = new Annotations.Color(0, 165, 228);
                textAnnot.TextAlign = 'center';

                textAnnot.Author = annotManager.getCurrentUser();

                annotManager.deselectAllAnnotations();
                annotManager.addAnnotation(textAnnot, true);
                annotManager.redrawAnnotation(textAnnot);
                annotManager.selectAnnotation(textAnnot);
                is_sign = false
            };

            async function digital_sign(cert_file_path, password, appearance_img_path, approvalFieldName = 'Signature') {
                console.log('================================================================================');
                console.log('Signing PDF document');

                document.getElementById('viewer').style.filter = "blur(25px)";
                $body.addClass("loading");

                // Open an existing PDF
                doc.initSecurityHandler();
                doc.lock();


                const sigHandlerId = await doc.addStdSignatureHandlerFromURL(cert_file_path, password);

                // Retrieve the unsigned approval signature field.
                const found_approval_field = await doc.getField(approvalFieldName);
                const found_approval_signature_digsig_field = await PDFNet.DigitalSignatureField.createFromField(found_approval_field);
                // (OPTIONAL) Add an appearance to the signature field.
                const img = await PDFNet.Image.createFromURL(doc, appearance_img_path);
                const found_approval_signature_widget = await PDFNet.SignatureWidget.createFromObj(await found_approval_field.getSDFObj());
                await found_approval_signature_widget.createSignatureAppearance(img);

                // Prepare the signature and signature handler for signing.
                await found_approval_signature_digsig_field.signOnNextSaveWithCustomHandler(sigHandlerId);

                // The actual approval signing will be done during the following incremental save operation.
                const docbuf = await doc.saveMemoryBuffer(PDFNet.SDFDoc.SaveOptions.e_incremental);

                await instance.closeDocument()

                await instance.loadDocument(docbuf, { filename: 'signed.pdf' })

                saveBufferAsPDFDoc(docbuf, 'signed.pdf');

                console.log('================================================================================');

                return myBlur()

                // window.open(fileObjectURL)
            }

            function myBlur() {
                setTimeout(
                    function () {
                        document.getElementById('viewer').style.filter = "blur(0px)";
                        $body.removeClass("loading");
                    }, 2000);
            }


            function create_text(content, type, x = 150, y = 150, point = {}, value = '', flag = {}) {
                const { docViewer, Annotations } = instance;
                const annotManager = docViewer.getAnnotationManager();
                const displayMode = docViewer.getDisplayModeManager().getDisplayMode();
                const page = displayMode.getSelectedPages(point, point);
                if (!!point.x && page.first == null) {
                    return; //don't add field to an invalid page location
                }
                const page_idx = docViewer.getCurrentPage()
                const zoom = docViewer.getZoom();

                var textAnnot = new Annotations.FreeTextAnnotation();
                textAnnot.PageNumber = page_idx;
                const rotation = docViewer.getCompleteRotation(page_idx) * 90;
                textAnnot.Rotation = rotation;
                if (rotation === 270 || rotation === 90) {
                    textAnnot.Width = 18.0 / zoom;
                    textAnnot.Height = 130.0 / zoom;
                } else {
                    textAnnot.Width = 130.0 / zoom;
                    textAnnot.Height = 18.0 / zoom;
                }
                textAnnot.X = x
                textAnnot.Y = y

                textAnnot.setPadding(new Annotations.Rect(0, 0, 0, 0));
                textAnnot.custom = {
                    type,
                    value,
                    flag,
                };

                // set the type of annot
                textAnnot.setContents(content);
                textAnnot.FontSize = '' + 15 / zoom + 'px';
                textAnnot.FillColor = new Annotations.Color(211, 211, 211, 1);
                textAnnot.TextColor = new Annotations.Color(14, 14, 16);
                textAnnot.StrokeThickness = 0.75;
                textAnnot.StrokeColor = new Annotations.Color(0, 56, 123);
                textAnnot.TextAlign = 'center';

                textAnnot.Author = annotManager.getCurrentUser();

                annotManager.deselectAllAnnotations();
                annotManager.addAnnotation(textAnnot, true);
                annotManager.redrawAnnotation(textAnnot);
                annotManager.selectAnnotation(textAnnot);

                is_sign = false
            };

            function signhere(x, y, fieldname = 'Signature') {
                return new Promise((resolve, reject) => {
                    // set flags for required
                    const flags = new WidgetFlags();
                    flags.set('Required', false);

                    // create a form field
                    const field = new Annotations.Forms.Field(fieldname, {
                        type: 'Sig',
                        flags,
                    });
                    // create a widget annotation
                    const widgetAnnot = new Annotations.SignatureWidgetAnnotation(field, {
                        appearance: '_DEFAULT',
                        appearances: {
                            _DEFAULT: {
                                Normal: {
                                    data:
                                        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuMWMqnEsAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC',
                                    offset: {
                                        x: 100,
                                        y: 100,
                                    },
                                },
                            },
                        },
                    });
                    // set position and size
                    widgetAnnot.PageNumber = docViewer.getCurrentPage();
                    widgetAnnot.X = x;
                    widgetAnnot.Y = y;
                    widgetAnnot.Width = 200;
                    widgetAnnot.Height = 60;

                    //add the form field and widget annotation
                    annotManager.addAnnotation(widgetAnnot);
                    annotManager.drawAnnotationsFromList([widgetAnnot]);
                    annotManager.getFieldManager().addField(field);
                    const done = true
                    if (done) {
                        resolve(importWidget(widgetAnnot))
                    } else {
                        reject()
                    }
                })
            }

            async function importWidget(widget) {
                var xfdf = await annotManager.exportAnnotations({
                    annotList: [widget],
                    widgets: true,
                });

                const fdf_doc = await PDFNet.FDFDoc.createFromXFDF(xfdf);

                // Merge FDF data into PDF doc
                doc.fdfUpdate(fdf_doc);
                console.log('hello done import...: ', fdf_doc)
            }

            async function exportAnnotations() {
                const doc_fields = doc.fdfExtract(PDFNet.PDFDoc.ExtractFlag.e_both); //PDFNet.PDFDoc.ExtractFlag.e_forms_only
                console.log('docfield: ', doc_fields)
                // Export annotations from FDF to XFDF.
                const xfdf_data = doc_fields.saveAsXFDFAsString;
                console.log('xfdf: ', xfdf_data)
                const fdf_doc = await PDFNet.FDFDoc.createFromXFDF(xfdf_data);

                // Merge FDF data into PDF doc
                doc.fdfUpdate(fdf_doc);
                console.log('hello done import...: ', fdf_doc)
            }
            //***************************************************************************************************//
            //***************************************** ENDING FUNCTION *****************************************//
            //***************************************************************************************************//

            //****************************** SET EVENT LISTENER ********************************//
            document.getElementById('electronic-signature').addEventListener('click', async () => {
                is_sign = false
                addField()
            });
            document.getElementById('initials').addEventListener('click', () => {
                create_text(content = dummy_user.initials, type = null, x = 350, y = 450)
            });
            document.getElementById('name').addEventListener('click', () => {
                create_text(content = content = dummy_user.firstname + " " + dummy_user.lastname, type = null, x = 350, y = 470)
            });
            document.getElementById('email').addEventListener('click', () => {
                create_text(content = dummy_user.email, type = null, x = 350, y = 490)
            });
            document.getElementById('job-title').addEventListener('click', () => {
                create_text(content = dummy_user.job_title, type = null, x = 350, y = 510)
            });
            document.getElementById('company').addEventListener('click', () => {
                create_text(content = dummy_user.company, type = null, x = 350, y = 530)
            });
            document.getElementById('date').addEventListener('click', () => {
                create_text(content = dummy_user.date, type = null, x = 350, y = 550)
            });
            document.getElementById('text-field').addEventListener('click', async () => {
                docViewer.dispose()
                // create_text(content = '', 140, 50)
            });
            document.getElementById('text-area').addEventListener('click', () => {
                digital_sign('cloudfca.pfx', '12345678', 'download.png', 'Signature2')
            });
            document.getElementById('radio-button').addEventListener('click', () => {
                signhere(300, 400, 'Signature2')
            });
            document.getElementById('add-text').addEventListener('click', () => {
                signhere(250, 250, 'Signature1')
            });
            document.getElementById('check-box').addEventListener('click', async () => {
                digital_sign('pdftron.pfx', 'password', 'download.png', 'Signature1')
            });
            document.getElementById('fix-field').addEventListener('click', () => {
                if (widgetEditingManager.isEditing()) {
                    widgetEditingManager.endEditing()
                } else {
                    widgetEditingManager.startEditing()
                }
            });
            document.getElementById('download-button').addEventListener('click', async () => {
                // docbuf = await doc.saveMemoryBuffer(PDFNet.SDFDoc.SaveOptions.e_incremental);
                // saveBufferAsPDFDoc(docbuf, 'signed.pdf');
                // instance.downloadPdf({
                //     includeAnnotations: true,
                //     useDisplayAuthor: true,
                // });
                instance.downloadPdf()
            })
            instance.setCustomPanel(myCustomPanel);

            const check = document.getElementById('after')
            function check_radio() {
                return check.checked
            }

            document.getElementById('merge').addEventListener('click', async () => {
                try {
                    const doc = docViewer.getDocument();
                    console.log('file: ', file)
                    const secondDoc = await CoreControls.createDocument(file);
                    console.log('alo alo ?')
                    const pagesToInsert = [1, 2];
                    const pageIndexToInsert = doc.getPageCount() + 1;
                    // in this example doc.getPageCount() returns 3
                    if (check_radio() == true) {
                        doc.insertPages(secondDoc, null, pageIndexToInsert).then(() => {
                            doc.getPageCount();
                            instance.closeElements(['menuOverlay', 'leftPanel'])
                            instance.openElements(['leftPanel']);
                        });
                    } else {
                        doc.insertPages(secondDoc).then(() => {
                            doc.getPageCount();
                            instance.closeElements(['leftPanel']);
                            instance.openElements(['leftPanel']);
                        });
                    }
                } catch (error) {
                    console.log(error)
                }
            })

            let file
            document.getElementById('file-picker101').onchange = async (e) => {
                file = e.target.files[0];
            };
            document.getElementById('print').addEventListener('click', () => {
                instance.print()
            })
            //********************************* END EVENT LISTENER ***********************************//
        });
    });

