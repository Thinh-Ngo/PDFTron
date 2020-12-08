

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
    initialDoc: "materials/contract.pdf",
    showLocalFilePicker: true,
    fullAPI: true,
    disabledElements: [
        'selectToolButton',
        'searchButton',
        'panToolButton',
        'menuButton',
        'rubberStampToolGroupButton',
        'stampToolGroupButton',
        'fileAttachmentToolGroupButton',
        'calloutToolGroupButton',
        'annotationStyleEditButton', 'linkButton',
        'undoButton', 'redoButton'
    ],
    licenseKey: 'Insert commercial license key here after purchase',
}, document.getElementById('viewer'))
    .then(instance => {

        instance.setActiveLeftPanel('notesPanel')
        instance.setMaxSignaturesCount(5)
        instance.setHeaderItems(function (header) {
            const toolsOverlay = header.getHeader('toolbarGroup-Annotate').get('toolsOverlay');
            console.log('toolsOverlay', toolsOverlay)
        })



        const { docViewer, Annotations, annotManager, Tools, CoreControls, iframeWindow } = instance;
        const { WidgetFlags } = Annotations;
        const signatureTool = docViewer.getTool(Tools.ToolNames.SIGNATURE);
        const widgetEditingManager = instance.annotManager.getWidgetEditingManager();
        const abc = iframeWindow.document.querySelectorAll('[data-element="toolbarGroup-Insert"]')
        const $body = $("body");

        let PDFNet = instance.PDFNet
        let file

        document.getElementById('side-bar').style.filter = "blur(20px)";
        document.getElementById('viewer').style.filter = "blur(20px)";
        $body.addClass("loading");
        instance.openElements(['leftPanel']);

        //****************************** ADD MERGE DOCUMENT ***************************//
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
                    return div
                }
            }
        };
        instance.setCustomPanel(myCustomPanel);
        //-----------------------------------------------------------------------------//


        //*****************************CATCH SIGNATURE EVENT AND SIGN ***************************/
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

        let is_sign = false
        let signature_holding

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
            await signhere(signatureAnnot.getX(), signatureAnnot.getY(), "Signature", signatureAnnot.getHeight(), signatureAnnot.getWidth());
            annotManager.deleteAnnotation(signatureAnnot);
            await digital_sign('cloudfca.pfx', '12345678', dataUrl, 'Signature');
            is_sign = false;
        });
        //_____________________________________ END CATCH EVENT ______________________________________//


        //***************************************************************************************************//
        //***************************************** CREATE FUNCTION *****************************************//
        //***************************************************************************************************//

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

            await updateDoc()

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

            await found_approval_signature_digsig_field.setLocation("Vancouver, BC");
            await found_approval_signature_digsig_field.setReason("Document approval.");
            await found_approval_signature_digsig_field.setContactInfo("www.pdftron.com");

            // The actual approval signing will be done during the following incremental save operation.
            const docbuf = await doc.saveMemoryBuffer(PDFNet.SDFDoc.SaveOptions.e_incremental);

            await instance.loadDocument(docbuf, { filename: 'signed.pdf' })

            // saveBufferAsPDFDoc(docbuf, 'signed.pdf');

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

        function signhere(x, y, fieldname = 'Signature', height, width) {
            return new Promise((resolve, reject) => {

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
                widgetAnnot.Width = width;
                widgetAnnot.Height = height;

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

        async function updateDoc() {
            const xfdf = await annotManager.exportAnnotations();
            const fdf_doc = await PDFNet.FDFDoc.createFromXFDF(xfdf);
            // Merge FDF data into PDF doc
            doc.fdfUpdate(fdf_doc);
            console.log('hello done udpate...: ', fdf_doc)
        }

        function create_datepicker() {
            const flags = new WidgetFlags();
            flags.set('Multiline', true);
            flags.set('Required', true);

            // create a form field
            const field = new Annotations.Forms.Field("DatePicker_1", {
                type: 'Tx',
                defaultValue: "11/12/2020",
                flags,
            });

            // create a widget annotation
            const widgetAnnot = new Annotations.DatePickerWidgetAnnotation(field);

            // set position and size
            widgetAnnot.PageNumber = 1;
            widgetAnnot.X = 100;
            widgetAnnot.Y = 100;
            widgetAnnot.Width = 50;
            widgetAnnot.Height = 20;

            //add the form field and widget annotation
            annotManager.addAnnotation(widgetAnnot);
            annotManager.drawAnnotationsFromList([widgetAnnot]);
            annotManager.getFieldManager().addField(field);
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
            hihi = await iframeWindow.document.querySelectorAll('[data-element="signatureToolGroupButton"]')
            xixi = iframeWindow.document.getElementsByClassName('signature-row-content interactable')[0].click()
        });
        document.getElementById('text-area').addEventListener('click', async () => {
            await iframeWindow.document.querySelectorAll('[data-element="styling-button"]')[0].click()
            iframeWindow.document.getElementsByClassName("signature-row-content add-btn")[0].click()
        });
        document.getElementById('radio-button').addEventListener('click', () => {
            create_datepicker()
        });
        document.getElementById('add-text').addEventListener('click', () => {
            signhere(250, 250, 'Signature1')
        });
        document.getElementById('check-box').addEventListener('click', async () => {
            // signhere(x, y, fieldname = 'Signature', height, width)
        });
        document.getElementById('fix-field').addEventListener('click', () => {
            if (widgetEditingManager.isEditing()) {
                widgetEditingManager.endEditing()
            } else {
                widgetEditingManager.startEditing()
            }
        });
        document.getElementById('download-button').addEventListener('click', async () => {
            await updateDoc()
            const docbuf = await doc.saveMemoryBuffer(PDFNet.SDFDoc.SaveOptions.e_incremental);
            saveBufferAsPDFDoc(docbuf, 'demo.pdf');
        })
        document.getElementById('file-picker101').onchange = async (e) => {
            file = e.target.files[0];
        };
        document.getElementById('print').addEventListener('click', () => {
            instance.print()
        })
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
                const pageIndexToInsert = doc.getPageCount() + 1;
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
        console.log('ViewerLOADEDDDDDDDD')
        let login = true

        docViewer.on('documentLoaded', async () => {
            await PDFNet.initialize();
            globalThis.doc = await docViewer.getDocument().getPDFDoc()
            const docbuf = await doc.saveMemoryBuffer(PDFNet.SDFDoc.SaveOptions.e_incremental);

            abc[0].click()
            $body.removeClass("loading");
            PDFNet = instance.PDFNet

            if (login) {
                signatureTool.importSignatures(['data:image/png;base64,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']);
                instance.loadDocument(docbuf, { filename: 'signed.pdf' })
                login = false
            }
            document.getElementById('side-bar').style.filter = "blur(0)";
            document.getElementById('viewer').style.filter = "blur(0px)";
        });
    })
