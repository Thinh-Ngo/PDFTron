
WebViewer({
    path: "WebViewer/lib",
    initialDoc: "signed (2).pdf",
    showLocalFilePicker: true,
    fullAPI: true,
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
}, document.getElementById('viewer'))
    .then(instance => {

        instance.disableElements(['annotationStyleEditButton', 'linkButton']);
        instance.setActiveLeftPanel('notesPanel')

        const { docViewer, Annotations, annotManager, Tools, PDFNet, iframeWindow } = instance;
        const { WidgetFlags } = Annotations;
        const signatureTool = docViewer.getTool(Tools.ToolNames.SIGNATURE);
        const widgetEditingManager = instance.annotManager.getWidgetEditingManager();
        
        instance.openElements(['leftPanel']);

      
        instance.setHeaderItems(header => {
            header.delete(4);
            header.unshift({
                type: 'divider'
            });
            header.get('viewControlsButton').insertBefore({
                type: 'spacer'
            });
        });

        docViewer.on('documentLoaded', async () => {

            await PDFNet.initialize();
            
            const doc = await docViewer.getDocument().getPDFDoc()

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
                    if (annotations['0'].G_ === "Sign here" && annotations['0'].ToolName === "AnnotationCreateCallout" && is_sign == true) {
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

                await instance.loadDocument(docbuf, { filename: 'signed.pdf' })

                saveBufferAsPDFDoc(docbuf, 'signed.pdf');

                console.log('================================================================================');

                return myBlur()
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
                exportAnnotations()
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
                instance.downloadPdf({
                    includeAnnotations: true,
                    useDisplayAuthor: true,
                });
            })
            //********************************* END EVENT LISTENER ***********************************//
        });
    });
