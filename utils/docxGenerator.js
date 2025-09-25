/**
 * Refactored DOCX Generator with LaTeX-to-Image Support and Answer Key Only Feature
 * Organized into separate modules for better maintainability
 * 
 * Required packages:
 * npm install docx axios canvas jsdom katex
 */


const { globalFileModel } = require('../model/globalLibraryFiles');
const { GlobalSectionModel } = require('../model/globalLibrarySections');
const { questionModel } = require('../model/Questions');
// const axios = require('axios');
const { createCanvas } = require('canvas');
const { JSDOM } = require('jsdom');
const katex = require('katex');

// DOCX imports
const { 
    Document, 
    Paragraph, 
    TextRun, 
    AlignmentType, 
    BorderStyle,
    ImageRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    Packer,
    PageBreak,  // Add this
    Header      // Add this
} = require('docx');

// ===================================
// CONFIGURATION MODULE
// ===================================

const CONFIG = {
    FONTS: {
        heading: "Arial",
        body: "Times New Roman",
        math: "serif"
    },
    COLORS: {
        primary: "2E86C1",    // Blue
        accent: "E74C3C",     // Red
        success: "27AE60",    // Green
        secondary: "85929E",  // Gray
        math: "0066CC"        // Math blue
    },
    SIZES: {
        title: 32,
        heading: 24,
        question: 22,
        option: 20,
        solution: 20,
        meta: 18,
        answerKey: 18  // Added for answer key
    },
    SPACING: {
        small: 100,
        medium: 200,
        large: 400
    },
    LATEX: {
        fontSize: 20,
        padding: 10,
        maxWidth: 400,
        maxHeight: 100
    },
    IMAGE: {
        timeout: 5000,
        maxSize: 5 * 1024 * 1024, // 5MB
        questionSize: { width: 400, height: 300 },
        optionSize: { width: 200, height: 150 }
    },
    background: {
        color: "E0E0E0", // Light gray
        text: "EXAMPLE",
        type: "diagonal"  // Diagonal across page
    }
};

// ===================================
// LATEX PROCESSING MODULE
// ===================================
class DataPreprocessor {
    /**
     * Recursively replace all [BLANK] with _____ in any JSON object/array
     */
    static replaceBlankInObject(obj) {
        if (typeof obj === 'string') {
            // Replace [BLANK] with _____ in strings
            return obj.replace(/\[BLANK\]/g, '_____');
        }
        
        if (Array.isArray(obj)) {
            // Process each item in array
            return obj.map(item => this.replaceBlankInObject(item));
        }
        
        if (obj && typeof obj === 'object') {
            // Process each property in object
            const processedObj = {};
            for (const [key, value] of Object.entries(obj)) {
                processedObj[key] = this.replaceBlankInObject(value);
            }
            return processedObj;
        }
        
        // Return primitive values as-is (numbers, booleans, null, undefined)
        return obj;
    }
        /**
     * Preprocess complete test data to replace all [BLANK] occurrences
     */
    static preprocessTestData(testData) {
        console.log('[PREPROCESSOR] Starting [BLANK] replacement in test data...');
        
        const startTime = Date.now();
        const processedData = this.replaceBlankInObject(testData);
        const duration = Date.now() - startTime;
        
        console.log(`[PREPROCESSOR] Completed [BLANK] replacement in ${duration}ms`);
        
        return processedData;
    }
}
class LatexProcessor {
    /**
     * Convert LaTeX string to image buffer
     */
    /**
 * Convert LaTeX string to image buffer
 */
/**
 * Convert LaTeX string to SVG, then to image buffer
 */
/**
 * Convert LaTeX string to image buffer
 */
static async latexToImage(latexString, isDisplayMode = false, isOption = false) {
    try {
        if (!latexString || latexString.length > 200) return null;
        
        console.log(`[LATEX] Converting: ${latexString}`);
        
        const fontSize = isDisplayMode ? CONFIG.LATEX.fontSize + 4 : CONFIG.LATEX.fontSize;
        const padding = 0;
        
        // Process LaTeX to Unicode
        const processedText = this.processLatexSymbols(latexString);
        
        // Calculate precise dimensions
        const estimatedWidth = Math.max(50, processedText.length * (fontSize * 0.6));
        const estimatedHeight = isDisplayMode ? fontSize * 1 : fontSize * 1;
        
        const canvas = createCanvas(estimatedWidth, estimatedHeight);
        const ctx = canvas.getContext('2d');
        
        // Set background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, estimatedWidth, estimatedHeight);
        
        // Draw text with no padding
        ctx.fillStyle = '#000000';
        ctx.font = `${fontSize}px ${CONFIG.FONTS.math}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(processedText, 0, estimatedHeight / 2);
        
        const buffer = canvas.toBuffer('image/png');
        
        // Validate buffer before returning
        if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
            console.error('[LATEX] Generated buffer is invalid');
            return null;
        }
        
        console.log(`[LATEX] Generated successfully: ${buffer.length} bytes`);
        
        return {
            buffer: buffer,
            width: Math.min(CONFIG.LATEX.maxWidth, estimatedWidth),
            height: Math.min(CONFIG.LATEX.maxHeight, estimatedHeight)
        };
        
    } catch (error) {
        console.error('[LATEX] Conversion failed:', error.message);
        return null;
    }
}

/**
 * Convert LaTeX string to SVG
 */
static latexToSVG(latexString, fontSize, isDisplayMode = false) {
    try {
        // Process LaTeX to Unicode
        const processedText = this.processLatexSymbols(latexString);
        
        // Calculate dimensions
        const estimatedWidth = Math.max(100, processedText.length * (fontSize * 0.6));
        const estimatedHeight = isDisplayMode ? fontSize * 1.5 : fontSize * 1.2;
        
        // Create SVG
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" 
                 width="${estimatedWidth}" 
                 height="${estimatedHeight}" 
                 viewBox="0 0 ${estimatedWidth} ${estimatedHeight}">
                <rect width="100%" height="100%" fill="white"/>
                <text x="0" 
                      y="${estimatedHeight/2}" 
                      font-family="${CONFIG.FONTS.math}" 
                      font-size="${fontSize}" 
                      fill="black" 
                      dominant-baseline="middle" 
                      text-anchor="start">
                    ${processedText}
                </text>
            </svg>
        `;
        
        return {
            svg: svg,
            width: estimatedWidth,
            height: estimatedHeight
        };
        
    } catch (error) {
        console.error('[LATEX] SVG creation failed:', error.message);
        return null;
    }
}

/**
 * Convert SVG to image buffer
 */
static async svgToImage(svgData, padding = 0) {
    try {
        const { svg, width, height } = svgData;
        
        // Create canvas
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Create image from SVG
        const img = new Image();
        const svgBlob = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
        
        return new Promise((resolve, reject) => {
            img.onload = () => {
                try {
                    // Draw SVG to canvas
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const buffer = canvas.toBuffer('image/png');
                    
                    resolve({
                        buffer: buffer,
                        width: Math.min(CONFIG.LATEX.maxWidth, width),
                        height: Math.min(CONFIG.LATEX.maxHeight, height)
                    });
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = (error) => {
                reject(new Error('Failed to load SVG image'));
            };
            
            img.src = svgBlob;
        });
        
    } catch (error) {
        console.error('[LATEX] SVG to image conversion failed:', error.message);
        return null;
    }
}




    /**
     * Convert LaTeX symbols to Unicode
     */
    static processLatexSymbols(latex) {
        const symbolMap = {
            // Greek letters
            '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
            '\\epsilon': 'ε', '\\theta': 'θ', '\\lambda': 'λ', '\\mu': 'μ',
            '\\pi': 'π', '\\sigma': 'σ', '\\phi': 'φ', '\\omega': 'ω',
            '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ',
            '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Phi': 'Φ', '\\Omega': 'Ω',
            
            // Mathematical operators
            '\\pm': '±', '\\times': '×', '\\div': '÷', '\\neq': '≠',
            '\\leq': '≤', '\\geq': '≥', '\\approx': '≈', '\\infty': '∞',
            '\\partial': '∂', '\\sum': '∑', '\\int': '∫', '\\sqrt': '√',
            
            // Arrows and relations
            '\\rightarrow': '→', '\\leftarrow': '←', '\\in': '∈', '\\notin': '∉'
        };

        let processed = latex;
        
        // Replace symbols
        Object.entries(symbolMap).forEach(([latexSymbol, unicode]) => {
            processed = processed.replace(new RegExp(latexSymbol.replace(/\\/g, '\\\\'), 'g'), unicode);
        });
        
        // Handle fractions
        processed = processed.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
        
        // Handle superscripts
        processed = processed.replace(/\^(\d)/g, (match, digit) => {
            const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
            return superscripts[parseInt(digit)] || `^${digit}`;
        });
        
        // Handle subscripts
        processed = processed.replace(/_(\d)/g, (match, digit) => {
            const subscripts = '₀₁₂₃₄₅₆₇₈₉';
            return subscripts[parseInt(digit)] || `_${digit}`;
        });
        
        // Clean up
        return processed.replace(/[{}]/g, '').replace(/\\\\/g, ' ');
    }

    /**
     * Process text and convert LaTeX expressions to images
     */
    /**
 * Process text and convert LaTeX expressions to images
 */
static async processTextWithLatex(text, isOption = false) {
    if (!text) return [new TextRun({ text: '' })];
    
    const textStr = String(text);
    const latexPattern = /\$\$(.*?)\$\$|\$([^$]*?)\$/g;
    const matches = [];
    let match;
    
    while ((match = latexPattern.exec(textStr)) !== null) {
        const latexContent = (match[1] || match[2]).trim();
        if (latexContent) {
            matches.push({
                start: match.index,
                end: match.index + match[0].length,
                latex: latexContent,
                isDisplay: !!match[1],
                original: match[0]
            });
        }
    }
    
    if (matches.length === 0) {
        return [new TextRun({ text: textStr })];
    }
    
    const elements = [];
    let currentIndex = 0;
    
    for (const latexMatch of matches) {
        // Add text before LaTeX
        if (latexMatch.start > currentIndex) {
            const textBefore = textStr.substring(currentIndex, latexMatch.start);
            if (textBefore) {
                elements.push(new TextRun({ text: textBefore }));
            }
        }
        
        // Convert LaTeX to image
        console.log(`[LATEX] Processing: ${latexMatch.latex}`);
        const imageData = await this.latexToImage(latexMatch.latex, latexMatch.isDisplay, isOption);
        
        if (imageData && imageData.buffer && Buffer.isBuffer(imageData.buffer) && imageData.buffer.length > 0) {
            console.log(`[LATEX] Adding image: ${imageData.buffer.length} bytes, ${imageData.width}x${imageData.height}`);
            elements.push(new ImageRun({
                data: imageData.buffer,
                transformation: {
                    width: imageData.width,
                    height: imageData.height
                }
            }));
        } else {
            // Fallback to styled text
            console.warn(`[LATEX] Failed to convert ${latexMatch.latex}, using text fallback`);
            elements.push(new TextRun({ 
                text: latexMatch.latex, 
                italics: true,
                color: CONFIG.COLORS.math
            }));
        }
        
        currentIndex = latexMatch.end;
    }
    
    // Add remaining text
    if (currentIndex < textStr.length) {
        const remainingText = textStr.substring(currentIndex);
        if (remainingText) {
            elements.push(new TextRun({ text: remainingText }));
        }
    }
    
    return elements;
}
}

// ===================================
// IMAGE PROCESSING MODULE
// ===================================

class ImageProcessor {
    /**
     * Resize image buffer to specified dimensions
     */
    static async resizeImage(imageBuffer, targetWidth, targetHeight) {
        try {
            const { loadImage } = require('canvas');
            
            // Create canvas with target dimensions
            const canvas = createCanvas(targetWidth, targetHeight);
            const ctx = canvas.getContext('2d');
            
            // Load image from buffer
            const img = await loadImage(imageBuffer);
            
            // Clear canvas with white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
            
            // Draw resized image
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            
            const resizedBuffer = canvas.toBuffer('image/png');
            return resizedBuffer;
            
        } catch (error) {
            console.error('[IMG] Resize failed:', error.message);
            return imageBuffer; // Return original buffer as fallback
        }
    }

    /**
     * Process fetched image and resize based on context
     */
    static async processFetchedImage(imageBuffer, isOption = false) {
        try {
            if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
                console.error('[IMG] Invalid image buffer provided');
                return null;
            }

            const targetWidth = isOption ? 50 : 150;
            const targetHeight = isOption ? 50 : 150;
            
            console.log(`[IMG] Resizing to ${targetWidth}x${targetHeight} (isOption: ${isOption})`);
            
            const resizedBuffer = await this.resizeImage(imageBuffer, targetWidth, targetHeight);
            
            // Ensure we return a valid buffer
            if (!resizedBuffer || !Buffer.isBuffer(resizedBuffer)) {
                console.error('[IMG] Resize returned invalid buffer');
                return {
                    buffer: imageBuffer, // Use original as fallback
                    width: targetWidth,
                    height: targetHeight
                };
            }
            
            return {
                buffer: resizedBuffer,
                width: targetWidth,
                height: targetHeight
            };
            
        } catch (error) {
            console.error('[IMG] Processing failed:', error.message);
            return null;
        }
    }

    /**
     * Fetch image safely with retries and resize
     */
    /**
 * Fetch image safely with retries and resize
 */
// static async fetchImage(url, retries = 2, isOption = false) {
//     if (!url || !url.startsWith('http')) {
//         console.warn('[IMG] Invalid URL provided:', url);
//         return null;
//     }
    
//     for (let attempt = 1; attempt <= retries; attempt++) {
//         try {
//             console.log(`[IMG] Fetching (${attempt}/${retries}): ${url.substring(0, 50)}...`);
            
//             const response = await axios.get(url, {
//                 responseType: 'arraybuffer',
//                 timeout: CONFIG.IMAGE.timeout,
//                 maxContentLength: CONFIG.IMAGE.maxSize,
//                 headers: {
//                     'User-Agent': 'Mozilla/5.0 (compatible; DocxGenerator/2.0)',
//                     'Accept': 'image/*'
//                 }
//             });
            
//             if (response.status === 200 && response.data?.byteLength > 500) {
//                 console.log(`[IMG] Success: ${response.data.byteLength} bytes`);
//                 const originalBuffer = Buffer.from(response.data);
                
//                 // Validate buffer
//                 if (!originalBuffer || originalBuffer.length === 0) {
//                     console.error('[IMG] Empty or invalid buffer received');
//                     continue;
//                 }
                
//                 // Double-check buffer is valid
//                 if (!Buffer.isBuffer(originalBuffer)) {
//                     console.error('[IMG] Created buffer is not a valid Buffer object');
//                     continue;
//                 }
                
//                 // Process and resize the image
//                 const processedImage = await this.processFetchedImage(originalBuffer, isOption);
                
//                 if (processedImage && processedImage.buffer && Buffer.isBuffer(processedImage.buffer) && processedImage.buffer.length > 0) {
//                     console.log(`[IMG] Processed successfully: ${processedImage.buffer.length} bytes, ${processedImage.width}x${processedImage.height}`);
                    
//                     // Final validation before returning
//                     const finalResult = {
//                         buffer: processedImage.buffer,
//                         width: processedImage.width,
//                         height: processedImage.height
//                     };
                    
//                     console.log(`[IMG] Final validation:`, {
//                         hasBuffer: !!finalResult.buffer,
//                         isBuffer: Buffer.isBuffer(finalResult.buffer),
//                         bufferLength: finalResult.buffer ? finalResult.buffer.length : 0,
//                         width: finalResult.width,
//                         height: finalResult.height
//                     });
                    
//                     return finalResult;
//                 } else {
//                     console.warn('[IMG] Processing failed or returned invalid data');
//                 }
//             }
            
//         } catch (error) {
//             console.warn(`[IMG] Attempt ${attempt} failed:`, error.message);
//             if (attempt < retries) {
//                 await new Promise(resolve => setTimeout(resolve, attempt * 1000));
//             }
//         }
//     }
    
//     console.error('[IMG] All fetch attempts failed for:', url);
//     return null;
// }
}

// ===================================
// STYLE CONFIGURATION MODULE
// ===================================

class StyleManager {
    /**
     * Create document styles
     */
    static createStyles() {
        return {
            paragraphStyles: [
                {
                    id: "title",
                    name: "Title",
                    run: { 
                        size: CONFIG.SIZES.title, 
                        bold: true, 
                        color: CONFIG.COLORS.primary, 
                        font: CONFIG.FONTS.heading 
                    },
                    paragraph: { 
                        alignment: AlignmentType.CENTER, 
                        spacing: { after: CONFIG.SPACING.large } 
                    }
                },
                {
                    id: "heading",
                    name: "Heading",
                    run: { 
                        size: CONFIG.SIZES.heading, 
                        bold: true, 
                        color: CONFIG.COLORS.primary, 
                        font: CONFIG.FONTS.heading 
                    },
                    paragraph: { 
                        spacing: { after: CONFIG.SPACING.medium, before: CONFIG.SPACING.large },
                        border: { 
                            bottom: { 
                                color: CONFIG.COLORS.primary, 
                                style: BorderStyle.SINGLE, 
                                size: 6 
                            } 
                        }
                    }
                },
                {
                    id: "question",
                    name: "Question",
                    run: { 
                        size: CONFIG.SIZES.question, 
                        font: CONFIG.FONTS.body 
                    },
                    paragraph: { 
                        spacing: { after: CONFIG.SPACING.medium } 
                    }
                },
                {
                    id: "option",
                    name: "Option",
                    run: { 
                        size: CONFIG.SIZES.option, 
                        font: CONFIG.FONTS.body 
                    },
                    paragraph: { 
                        spacing: { after: CONFIG.SPACING.small }, 
                        indent: { left: 400 } 
                    }
                },
                {
                    id: "solution",
                    name: "Solution",
                    run: { 
                        size: CONFIG.SIZES.solution, 
                        color: CONFIG.COLORS.accent, 
                        font: CONFIG.FONTS.body 
                    },
                    paragraph: { 
                        spacing: { after: CONFIG.SPACING.small }, 
                        indent: { left: 200 } 
                    }
                },
                {
                    id: "meta",
                    name: "Meta",
                    run: { 
                        size: CONFIG.SIZES.meta, 
                        color: CONFIG.COLORS.secondary, 
                        italics: true, 
                        font: CONFIG.FONTS.body 
                    },
                    paragraph: { 
                        spacing: { after: CONFIG.SPACING.small } 
                    }
                },
                // NEW STYLE FOR ANSWER KEY
                {
                    id: "answerKey",
                    name: "Answer Key",
                    run: { 
                        size: CONFIG.SIZES.answerKey, 
                        font: CONFIG.FONTS.body,
                        bold: false
                    },
                    paragraph: { 
                        spacing: { after: CONFIG.SPACING.small } 
                    }
                }
            ]
        };
    }
}

// ===================================
// CONTENT CREATION MODULES
// ===================================

class HeaderCreator {
    /**
     * Create page header content for first page only
     */
    static async createFirstPageHeader(testData, isAnswerKeyOnly = false) {
        const children = [];
        
        // Title - modify for answer key
        const titleText = isAnswerKeyOnly ? 
            `${testData.name || "Practice Test"} - Answer Key` : 
            testData.name || "Practice Test";
            
        children.push(new Paragraph({
            children: [new TextRun({
                text: titleText,
                bold: true,
                size: CONFIG.SIZES.title,
                color: CONFIG.COLORS.primary,
                font: CONFIG.FONTS.heading
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: CONFIG.SPACING.medium }
        }));
        
        // Test details - skip for answer key only
        if (!isAnswerKeyOnly) {
            const details = this.buildTestDetails(testData);
            if (details.length > 0) {
                children.push(new Paragraph({
                    children: [new TextRun({
                        text: details.join(' | '),
                        size: CONFIG.SIZES.meta,
                        color: CONFIG.COLORS.secondary,
                        italics: true,
                        font: CONFIG.FONTS.body
                    })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: CONFIG.SPACING.small }
                }));
            }
            
            // Description with LaTeX support
            if (testData.description) {
                children.push(new Paragraph({
                    children: await LatexProcessor.processTextWithLatex(testData.description),
                    alignment: AlignmentType.CENTER,
                    spacing: { after: CONFIG.SPACING.small }
                }));
            }
        }
        
        // Add spacing after header
        children.push(new Paragraph({
            children: [new TextRun({ text: "" })],
            spacing: { after: CONFIG.SPACING.large }
        }));
        
        return children;
    }

    /**
     * Build test details array
     */
    static buildTestDetails(testData) {
        const details = [];
        if (testData.date) details.push(`Date: ${testData.date}`);
        if (testData.duration) details.push(`Duration: ${testData.duration}`);
        if (testData.sections?.length) details.push(`Sections: ${testData.sections.length}`);
        return details;
    }
}

class SectionCreator {
    /**
     * Create section content
     */
    static async createSection(section, sectionNumber, includeSolutions, isAnswerKeyOnly = false) {
        const children = [];
        
        // Section header - modify for answer key
        if (isAnswerKeyOnly) {
            children.push(new Paragraph({
                style: "heading",
                children: [new TextRun({ 
                    text: `Section ${sectionNumber} Answer Key` 
                })]
            }));
        } else {
            children.push(new Paragraph({
                style: "heading",
                children: [new TextRun({ 
                    text: `Section ${sectionNumber}: ${section.name || 'Untitled'}` 
                })]
            }));
            
            // Section instructions - skip for answer key
            if (section.instructions) {
                children.push(new Paragraph({
                    style: "meta",
                    children: await LatexProcessor.processTextWithLatex(section.instructions)
                }));
            }
            
            // Section summary - skip for answer key
            const summary = this.buildSectionSummary(section);
            children.push(new Paragraph({
                style: "meta",
                children: [new TextRun({ text: summary })]
            }));
        }
        
        children.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
        
        // Questions
        const questions = section.questions || [];
        for (let i = 0; i < questions.length; i++) {
            if (isAnswerKeyOnly) {
                const answerKeyContent = await AnswerKeyCreator.createAnswerKeyEntry(
                    questions[i], 
                    i + 1
                );
                children.push(...answerKeyContent);
            } else {
                const questionContent = await QuestionCreator.createQuestion(
                    questions[i], 
                    i + 1, 
                    includeSolutions
                );
                children.push(...questionContent);
            }
        }
        
        return children;
    }

    /**
     * Build section summary
     */
    static buildSectionSummary(section) {
        const totalQuestions = section.questions?.length || 0;
        const totalMarks = section.questions?.reduce((sum, q) => sum + (q.marks || 0), 0) || 0;
        return `Questions: ${totalQuestions} | Marks: ${totalMarks}`;
    }
}

// ===================================
// NEW ANSWER KEY CREATOR MODULE
// ===================================

class AnswerKeyCreator {
    /**
     * Create answer key entry for a question
     * Format: [Question Number]: [Answer]
     */
    static async createAnswerKeyEntry(question, questionNumber) {
        const children = [];
        
        try {
            const answer = this.extractAnswer(question);
            
            children.push(new Paragraph({
                style: "answerKey",
                children: [new TextRun({
                    text: `${questionNumber}: ${answer}`,
                    font: CONFIG.FONTS.body,
                    size: CONFIG.SIZES.answerKey
                })]
            }));
            
        } catch (error) {
            console.error(`Error creating answer key for question ${questionNumber}:`, error.message);
            children.push(new Paragraph({
                style: "answerKey",
                children: [new TextRun({
                    text: `${questionNumber}: [Answer not available]`,
                    color: CONFIG.COLORS.accent
                })]
            }));
        }
        
        return children;
    }

    /**
     * Extract the correct answer from a question based on its type
     */
    static extractAnswer(question) {
        switch (question.type) {
            case "mcq":
                return this.extractMCQAnswer(question);
            case "truefalse":
                return this.extractTrueFalseAnswer(question);
            case "integerType":
                return this.extractIntegerAnswer(question);
            case "fillintheblank":
                return this.extractFillInBlankAnswer(question);
            case "comprehension":
                return this.extractComprehensionAnswer(question);
            default:
                return this.extractGenericAnswer(question);
        }
    }

    /**
     * Extract MCQ answer (return option letter)
     */
    static extractMCQAnswer(question) {
        if (!question.options?.length) return "N/A";
        
        // Find correct option
        const correctOptionIndex = question.options.findIndex(option => 
            option.isCorrect || option.correct || option.isRight
        );
        
        if (correctOptionIndex !== -1) {
            return String.fromCharCode(97 + correctOptionIndex); // a, b, c, d...
        }
        
        // Fallback: check correctOptionId
        if (question.correctOptionId) {
            const correctOption = question.options.find(option => 
                option._id?.toString() === question.correctOptionId?.toString()
            );
            
            if (correctOption) {
                const correctIndex = question.options.indexOf(correctOption);
                return String.fromCharCode(97 + correctIndex);
            }
        }
        
        return "N/A";
    }

    /**
     * Extract True/False answer
     */
    static extractTrueFalseAnswer(question) {
        if (question.correctAnswer !== undefined) {
            return question.correctAnswer ? "True" : "False";
        }
        
        // Check in options
        if (question.options?.length) {
            const correctOption = question.options.find(option => 
                option.isCorrect || option.correct
            );
            if (correctOption) {
                return correctOption.text?.toLowerCase().includes('true') ? "True" : "False";
            }
        }
        
        return "N/A";
    }

    /**
     * Extract Integer type answer
     */
    static extractIntegerAnswer(question) {
        if (question.correctAnswer !== undefined) {
            return question.correctAnswer.toString();
        }
        
        if (question.answer !== undefined) {
            return question.answer.toString();
        }
        
        if (question.solution) {
            // Try to extract number from solution
            const numberMatch = question.solution.match(/\b\d+(\.\d+)?\b/);
            if (numberMatch) {
                return numberMatch[0];
            }
        }
        
        return "N/A";
    }

    /**
     * Extract Fill in the blank answer
     */
    static extractFillInBlankAnswer(question) {
        // Check if blanks array exists and has answers
        if (question.blanks && Array.isArray(question.blanks) && question.blanks.length > 0) {
            const answers = question.blanks
                .map(blank => blank.correctAnswer || blank.answer)
                .filter(answer => answer && answer.trim()) // Filter out empty/null answers
                .join(', '); // Join with comma and space
            
            if (answers) {
                return answers;
            }
        }
        
        // Fallback to old logic
        if (question.correctAnswer) {
            return question.correctAnswer;
        }
        
        if (question.answer) {
            return question.answer;
        }
        
        // Check if solution contains the answer
        if (question.solution) {
            return question.solution.replace(/\n/g, ' ').trim();
        }
        
        return "N/A";
    }

    /**
     * Extract Comprehension answer (usually MCQ format)
     */
    static extractComprehensionAnswer(question) {
        // Comprehension questions are usually MCQ format
        return this.extractMCQAnswer(question);
    }

    /**
     * Extract generic answer (fallback)
     */
    static extractGenericAnswer(question) {
        // Try various common answer fields
        if (question.correctAnswer !== undefined) {
            return question.correctAnswer.toString();
        }
        
        if (question.answer !== undefined) {
            return question.answer.toString();
        }
        
        if (question.solution) {
            // Return first line of solution as answer
            const firstLine = question.solution.split('\n')[0].trim();
            return firstLine || "See solution";
        }
        
        return "N/A";
    }
}

class QuestionCreator {

    static processTextForBlanks(text) {
        if (!text) return text;
        
        // Replace [BLANK] with underscores for all question types
        return text.replace(/\[BLANK\]/g, '_____');
    }

    static async addQuestionText(children, question, questionNumber) {
        try {
            // Process the question text to replace [BLANK] with underscores
            const processedQuestionText = this.processTextForBlanks(
                question.questionText || `Question ${questionNumber}`
            );
            
            const processedText = await LatexProcessor.processTextWithLatex(
                processedQuestionText, 
                false // Pass isOption = false for questions
            );
            
            children.push(new Paragraph({
                style: "question",
                children: [
                    new TextRun({ text: `${questionNumber}. `, bold: true }),
                    ...processedText
                ]
            }));
        } catch (error) {
            console.error(`[DEBUG] Error processing question text:`, error.message);
            // Fallback to simple text with [BLANK] replaced
            const fallbackText = this.processTextForBlanks(
                question.questionText || `Question ${questionNumber}`
            );
            children.push(new Paragraph({
                style: "question",
                children: [
                    new TextRun({ text: `${questionNumber}. ${fallbackText}` })
                ]
            }));
        }
    }
    /**
     * Create question content
     */
    static async createQuestion(question, questionNumber, includeSolutions) {
        const children = [];
        
        try {
            // Question text (with [BLANK] replaced automatically)
            await this.addQuestionText(children, question, questionNumber);
            
            // Question image
            await this.addQuestionImage(children, question);
            
            // Meta information
            await this.addMetaInfoWithTable(children, question);
            
            // Question type specific content
            await this.addQuestionTypeContent(children, question);
            
            // Solution (if requested and present)
            if (includeSolutions && question.solution) {
                await this.addSolution(children, question);
            }
            
            // Separator
            this.addSeparator(children);
            
        } catch (error) {
            console.error(`Error creating question ${questionNumber}:`, error.message);
            children.push(new Paragraph({
                children: [new TextRun({ 
                    text: `[Error in question ${questionNumber}: ${error.message}]`,
                    color: CONFIG.COLORS.accent
                })]
            }));
        }
        
        return children;
    }

    /**
     * Add question text
     */
    static async addQuestionText(children, question, questionNumber) {
        children.push(new Paragraph({
            style: "question",
            children: [
                new TextRun({ text: `${questionNumber}. `, bold: true }),
                ...(await LatexProcessor.processTextWithLatex(
                    question.questionText || `Question ${questionNumber}`
                ))
            ]
        }));
    }


static async addQuestionImage(children, question) {
    if (question.questionUrl) {
        try {
            console.log(`[DEBUG] Fetching question image: ${question.questionUrl}`);
            const imageData = await ImageProcessor.fetchImage(question.questionUrl, 2, false);
            
            // Only add image if we have valid data
            if (imageData?.buffer && Buffer.isBuffer(imageData.buffer) && imageData.buffer.length > 0) {
                children.push(new Paragraph({
                    children: [new ImageRun({
                        data: imageData.buffer,
                        transformation: {
                            width: imageData.width,
                            height: imageData.height
                        }
                    })],
                    spacing: { after: CONFIG.SPACING.medium }
                }));
                console.log(`[DEBUG] Question image added successfully`);
            } else {
                console.warn(`[DEBUG] Skipping invalid question image`);
            }
        } catch (error) {
            console.error(`[DEBUG] Error adding question image:`, error.message);
            // Don't add anything if there's an error
        }
    }
}

/**
 * Add MCQ options
 */
static async addMCQOptions(children, question) {
    if (!question.options?.length) return;
    
    for (let i = 0; i < question.options.length; i++) {
        const option = question.options[i];
        
        // Process option text to replace [BLANK] with underscores
        const processedOptionText = this.processTextForBlanks(
            option.text || `Option ${i + 1}`
        );
        
        const optionText = [
            new TextRun({ text: `${String.fromCharCode(97 + i)}. `, bold: true }),
            ...(await LatexProcessor.processTextWithLatex(
                processedOptionText, 
                true // Pass isOption = true for options
            ))
        ];
        
        
        
        children.push(new Paragraph({
            style: "option",
            children: optionText
        }));
        
        // Option image (unchanged)
        if (option.optionUrl) {
            try {
                console.log(`[DEBUG] Fetching option image: ${option.optionUrl}`);
                const optionImageData = await ImageProcessor.fetchImage(option.optionUrl, 2, true);
                
                if (optionImageData?.buffer && Buffer.isBuffer(optionImageData.buffer) && optionImageData.buffer.length > 0) {
                    children.push(new Paragraph({
                        children: [new ImageRun({
                            data: optionImageData.buffer,
                            transformation: {
                                width: optionImageData.width,
                                height: optionImageData.height
                            }
                        })],
                        indent: { left: 600 }
                    }));
                    console.log(`[DEBUG] Option image added successfully`);
                } else {
                    console.warn(`[DEBUG] Skipping invalid option image`);
                }
            } catch (error) {
                console.error(`[DEBUG] Error adding option image:`, error.message);
            }
        }
    }
}

/**
 * Add question text
 */
static async addQuestionText(children, question, questionNumber) {
    try {
        const processedText = await LatexProcessor.processTextWithLatex(
            question.questionText || `Question ${questionNumber}`, false // Pass isOption = false for questions
        );
        
        children.push(new Paragraph({
            style: "question",
            children: [
                new TextRun({ text: `${questionNumber}. `, bold: true }),
                ...processedText
            ]
        }));
    } catch (error) {
        console.error(`[DEBUG] Error processing question text:`, error.message);
        // Fallback to simple text
        children.push(new Paragraph({
            style: "question",
            children: [
                new TextRun({ text: `${questionNumber}. ${question.questionText || `Question ${questionNumber}`}` })
            ]
        }));
    }
}
    /**
     * Add meta information
     */
    static async addMetaInfoWithTable(children, question) {
        const leftSide = [];
        const rightSide = [];
        
        // Left side: Marks information
        if (question.marks) {
            leftSide.push(`Marks: +${question.marks}`);
            
            if (question.negativeMarking && question.negativeMarksValue) {
                leftSide.push(`(-${question.negativeMarksValue})`);
            }
        }
        
        // Right side: Year and Exams
        if (question.year) {
            rightSide.push(question.year);
        }
        
        if (question.titles?.length) {
            rightSide.push(question.titles.join(' '));
        }
        
        // Create table if we have any information
        if (leftSide.length > 0 || rightSide.length > 0) {
            const leftText = leftSide.join(' | ');
            const rightText = rightSide.join(' | ');
            
            const table = new Table({
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({ 
                                        text: leftText || '',
                                        size: CONFIG.SIZES.meta,
                                        color: CONFIG.COLORS.secondary,
                                        italics: true,
                                        font: CONFIG.FONTS.body
                                    })],
                                    spacing: { after: 0, before: 0 }
                                })],
                                width: { size: 50, type: WidthType.PERCENTAGE },
                                margins: {
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    right: 0
                                },
                                borders: {
                                    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
                                },
                                verticalAlign: "center"
                            }),
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({ 
                                        text: rightText || '',
                                        size: CONFIG.SIZES.meta,
                                        color: CONFIG.COLORS.secondary,
                                        italics: true,
                                        font: CONFIG.FONTS.body
                                    })],
                                    alignment: AlignmentType.RIGHT,
                                    spacing: { after: 0, before: 0 }
                                })],
                                width: { size: 50, type: WidthType.PERCENTAGE },
                                margins: {
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    right: 0
                                },
                                borders: {
                                    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
                                },
                                verticalAlign: "center"
                            })
                        ],
                        height: { value: 0, rule: "auto" }
                    })
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
                },
                margins: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0
                }
            });
            
            children.push(table);
        }
    }

    /**
     * Add question type specific content
     */
    static async addQuestionTypeContent(children, question) {
        switch (question.type) {
            case "mcq":
                await this.addMCQOptions(children, question);
                break;
            case "truefalse":
                await this.addTrueFalseOptions(children);
                break;
            case "integerType":
                await this.addIntegerTypeContent(children);
                break;
            case "fillintheblank":
                await this.addFillInBlankContent(children, question);
                break;
            case "comprehension":
                await this.addComprehensionContent(children, question);
                break;
        }
    }

    /**


    /**
     * Add True/False options
     */
    static async addTrueFalseOptions(children) {
        children.push(new Paragraph({
            style: "option",
            children: [new TextRun({ text: "a. True" })]
        }));
        children.push(new Paragraph({
            style: "option",
            children: [new TextRun({ text: "b. False" })]
        }));
    }

    /**
     * Add Integer type content
     */
    static async addIntegerTypeContent(children) {
        children.push(new Paragraph({
            style: "option",
            children: [new TextRun({ text: "Answer: ____" })]
        }));
    }

    /**
     * Add Fill in the blank content
     */
    static async addFillInBlankContent(children, question) {
        // Do nothing - [BLANK] is already replaced in the question text
        // No additional line needed for fill in the blank questions
        return;
    }

    /**
     * Add Comprehension content
     */
    static async addComprehensionContent(children, question) {
        if (question.passage) {
            children.push(new Paragraph({
                children: [new TextRun({ text: "Passage:", bold: true })],
                spacing: { after: CONFIG.SPACING.small }
            }));
            
            // Process passage to replace [BLANK] with underscores
            const processedPassage = this.processTextForBlanks(question.passage);
            
            children.push(new Paragraph({
                style: "option",
                children: await LatexProcessor.processTextWithLatex(processedPassage)
            }));
        }
    }

    /**
     * Add solution
     */
    static async addSolution(children, question) {
        if (!question.solution) return;
        
        children.push(new Paragraph({
            children: [new TextRun({ 
                text: "Solution:", 
                bold: true, 
                color: CONFIG.COLORS.accent 
            })],
            spacing: { before: CONFIG.SPACING.medium }
        }));
        
        const solutionText = String(question.solution)
            .replace(/\\n/g, '\n')
            .split('\n')
            .filter(line => line.trim());
            
        for (const line of solutionText) {
            // Also process [BLANK] in solution text
            const processedSolutionLine = this.processTextForBlanks(line.trim());
            
            children.push(new Paragraph({
                style: "solution",
                children: await LatexProcessor.processTextWithLatex(processedSolutionLine)
            }));
        }
    }

    /**
     * Add separator
     */
    static addSeparator(children) {
        children.push(new Paragraph({
            children: [new TextRun({ 
                text: "─".repeat(50), 
                color: CONFIG.COLORS.secondary 
            })],
            spacing: { before: CONFIG.SPACING.medium, after: CONFIG.SPACING.large },
            alignment: AlignmentType.CENTER
        }));
    }
}

// ===================================
// DOCUMENT GENERATION MODULE
// ===================================

// ===================================
// UPDATED DOCUMENT GENERATOR WITH WATERMARK
// ===================================

class DocumentGenerator {
    /**
     * Generate DOCX document with header on first page only and simple watermark on all pages
     * Updated to support Answer Key Only mode
     */
    static async generateDocx(testData, options = {}) {
        const { includeSolutions = true, isDoubleColumn = false, isAnswerKeyOnly = false } = options;
        
        try {
            console.log(`[DOCX] Starting generation with first page header and simple watermark... (Answer Key Only: ${isAnswerKeyOnly})`);
            
            if (!testData?.sections?.length) {
                throw new Error('No test sections found');
            }
            
            // PREPROCESS: Replace all [BLANK] with _____ before any processing
            const processedTestData = DataPreprocessor.preprocessTestData(testData);
            
            // Create all content (questions only, no header content)
            const allChildren = [];
            
            // Add simple watermark as first element
            // allChildren.push(this.createSimpleWatermark());
            
            // Sections content only (no header content in document body)
            for (let i = 0; i < processedTestData.sections.length; i++) {
                const sectionChildren = await SectionCreator.createSection(
                    processedTestData.sections[i], 
                    i + 1, 
                    includeSolutions,
                    isAnswerKeyOnly
                );
                allChildren.push(...sectionChildren);
            }
            
            // Create page headers (first page and default)
            const headers = this.createHeaders(processedTestData, isAnswerKeyOnly);
            
            // Create document with header on first page only and simple watermark
            const doc = new Document({
                creator: "Test Generator",
                title: processedTestData.name || "Practice Test",
                styles: StyleManager.createStyles(),
                sections: [{
                    properties: {
                        page: { 
                            margin: { 
                                top: 1440, // Leave space for header
                                right: 1440, 
                                bottom: 1440, 
                                left: 1440 
                            } 
                        },
                        column: isDoubleColumn ? 
                            { count: 2, space: 720 } : 
                            { count: 1 },
                        titlePage: true // Enable different first page
                    },
                    headers: headers,
                    children: allChildren
                }]
            });
            
            // Generate buffer
            const buffer = await Packer.toBuffer(doc);
            console.log(`[DOCX] Generated successfully: ${buffer.length} bytes`);
            
            return buffer;
            
        } catch (error) {
            console.error('[DOCX] Generation failed:', error);
            throw error;
        }
    }

    /**
     * Create simple watermark as text element
     */
    static createSimpleWatermark() {
        return new Paragraph({
            children: [new TextRun({
                text: "EXAMPLE",
                size: 120, // Large but not too large
                color: "E0E0E0", // Light gray
                font: CONFIG.FONTS.heading,
                bold: true
            })],
            alignment: AlignmentType.CENTER,
            spacing: { 
                before: 0, 
                after: -2000 // Negative spacing to position behind content
            }
        });
    }

    /**
     * Create headers for first page and subsequent pages
     * Updated to support Answer Key Only mode
     */
    static createHeaders(testData, isAnswerKeyOnly = false) {
        return {
            // Header for first page only
            first: new Header({
                children: [
                    // Title
                    new Paragraph({
                        children: [new TextRun({
                            text: isAnswerKeyOnly ? 
                                `${testData.name || "Practice Test"} - Answer Key` : 
                                testData.name || "Practice Test",
                            bold: true,
                            size: CONFIG.SIZES.title,
                            color: CONFIG.COLORS.primary,
                            font: CONFIG.FONTS.heading
                        })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: CONFIG.SPACING.medium }
                    }),
                    
                    // Test details - skip for answer key only
                    ...(isAnswerKeyOnly ? [] : this.createTestDetailsInHeader(testData)),
                    
                    // Description (if exists) - skip for answer key only
                    ...(isAnswerKeyOnly ? [] : this.createDescriptionInHeader(testData)),
                    
                    // Spacing after header
                    new Paragraph({
                        children: [new TextRun({ text: "" })],
                        spacing: { after: CONFIG.SPACING.large }
                    })
                ]
            }),
            
            // Empty header for subsequent pages
            default: new Header({
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: "" })],
                        spacing: { after: 0 }
                    })
                ]
            })
        };
    }

    /**
     * Create test details for header
     */
    static createTestDetailsInHeader(testData) {
        const details = [];
        if (testData.date) details.push(`Date: ${testData.date}`);
        if (testData.duration) details.push(`Duration: ${testData.duration}`);
        if (testData.sections?.length) details.push(`Sections: ${testData.sections.length}`);
        
        if (details.length > 0) {
            return [
                new Paragraph({
                    children: [new TextRun({
                        text: details.join(' | '),
                        size: CONFIG.SIZES.meta,
                        color: CONFIG.COLORS.secondary,
                        italics: true,
                        font: CONFIG.FONTS.body
                    })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: CONFIG.SPACING.small }
                })
            ];
        }
        return [];
    }

    /**
     * Create description for header (synchronous version)
     */
    static createDescriptionInHeader(testData) {
        if (testData.description) {
            return [
                new Paragraph({
                    children: [new TextRun({
                        text: testData.description,
                        size: CONFIG.SIZES.meta,
                        color: CONFIG.COLORS.secondary,
                        italics: true,
                        font: CONFIG.FONTS.body
                    })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: CONFIG.SPACING.small }
                })
            ];
        }
        return [];
    }
}



// ===================================
// DATA FETCHING MODULE
// ===================================

class DataFetcher {
    /**
     * Fetch complete test data
     */
    static async fetchTestData(testId) {
        console.log(`[DATA] Fetching test data for ID: ${testId}`);
        
        // Fetch test
        const test = await globalFileModel.findById(testId).lean();
        if (!test) {
            throw new Error("Test not found");
        }
        
        // Fetch sections
        const sections = await GlobalSectionModel.find({ parentId: testId }).lean();
        if (!sections.length) {
            throw new Error("No sections found");
        }
        
        // Fetch questions
        const sectionIds = sections.map(sec => sec._id);
        const allQuestions = await questionModel.find({ 
            sectionId: { $in: sectionIds } 
        }).lean();
        
        // Group questions by section
        const questionMap = this.groupQuestionsBySection(allQuestions);
        
        // Attach questions to sections
        sections.forEach(section => {
            section.questions = questionMap[String(section._id)] || [];
        });
        
        console.log(`[DATA] Loaded: ${sections.length} sections, ${allQuestions.length} questions`);
        
        return { ...test, sections };
    }

    /**
     * Group questions by section ID
     */
    static groupQuestionsBySection(allQuestions) {
        const questionMap = {};
        
        allQuestions.forEach(question => {
            const sids = Array.isArray(question.sectionId) ? 
                question.sectionId : 
                [question.sectionId];
                
            sids.forEach(sid => {
                const sidStr = String(sid);
                if (!questionMap[sidStr]) {
                    questionMap[sidStr] = [];
                }
                questionMap[sidStr].push(question);
            });
        });
        
        return questionMap;
    }
}

// ===================================
// MAIN API CONTROLLER
// ===================================

/**
 * Main API endpoint for generating practice test DOCX
 * Updated to support Answer Key Only mode
 */
exports.generatePracticeTestDocx = async (req, res) => {
    const startTime = Date.now();
    const { 
        id, 
        withSolution = true, 
        isDoubleColumn = false, 
        watermarkType = "simple",
        AnswerKeyOnly = false  // NEW PARAMETER
    } = req.body;
    
    if (!id) {
        return res.status(400).json({ message: "Test ID is required" });
    }
    
    try {
        console.log(`[API] Starting DOCX generation for test: ${id} with watermark: ${watermarkType}, Answer Key Only: ${AnswerKeyOnly}`);
        
        // Fetch test data
        const testData = await DataFetcher.fetchTestData(id);
        
        // Generate document with new option
        let buffer = await DocumentGenerator.generateDocx(testData, {
            includeSolutions: AnswerKeyOnly ? false : withSolution, // Ignore withSolution if AnswerKeyOnly is true
            isDoubleColumn,
            isAnswerKeyOnly: AnswerKeyOnly
        });
           
        // Send response with updated filename
        const filename = AnswerKeyOnly ? 
            `test_${id}_answer_key.docx` : 
            `test_${id}_${withSolution ? 'with' : 'without'}_solutions.docx`;
        const duration = Date.now() - startTime;
        
        console.log(`[API] Success: Generated ${buffer.length} bytes in ${duration}ms`);
        
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", buffer.length.toString());
        
        return res.send(buffer);
        
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[API] Failed after ${duration}ms:`, error.message);
        
        res.status(500).json({ 
            message: "Document generation failed", 
            error: error.message,
            duration
        });
    }
};
