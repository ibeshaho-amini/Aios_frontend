"use client"

import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getRecommendationDetails } from "../../Redux/Recommendation/cropRecommendation"
import { FiX, FiPrinter, FiAlertCircle } from "react-icons/fi"

const RecommendationReportModal = ({ recId, isOpen, onClose }) => {
  const dispatch = useDispatch()
  const { selectedRecommendation, isLoading, error } = useSelector(
    (state) => state.recommendation
  )

  useEffect(() => {
    if (isOpen && recId) {
      dispatch(getRecommendationDetails(recId))
    }
  }, [dispatch, recId, isOpen])

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    const reportContent = document.getElementById("report-content")?.innerHTML || "<div/>"

    printWindow.document.write(`
      <html>
        <head>
          <title>Crop Recommendation Report</title>
          <style>
            body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #111827; margin: 0; }
            .container { max-width: 800px; margin: 0 auto; padding: 24px; }
            h1 { font-size: 22px; margin: 0 0 12px; color: #111827; }
            h2 { font-size: 14px; margin: 16px 0 8px; color: #374151; font-weight: 700; }
            .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
            .crop { font-size: 22px; font-weight: 800; color: #065f46; margin-top: 4px; }
            .text p { margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #111827; line-height: 1.75; }
            .muted { color: #6b7280; font-size: 12px; margin-top: 8px; }
            @page { size: A4; margin: 1.5cm; }
          </style>
        </head>
        <body>
          <div class="container">
            ${reportContent}
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  if (!isOpen) return null

  const rec = selectedRecommendation || {}
  const predictedCrop =
    rec.crop_predicted ||
    rec.ai_outputs?.crop_predicted ||
    rec.ai_outputs?.recommended_crop ||
    ""

  // Helper to render bold, well-spaced paragraphs
  const renderParagraphs = (text) => {
    if (!text) return null
    return text
      .split(/\r?\n\r?\n|\r?\n/) // split on blank line or newline
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p, idx) => (
        <p key={idx} className="mb-3 last:mb-0 font-semibold text-gray-900 leading-7">
          {p}
        </p>
      ))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header (not printed) */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Crop Recommendation Report</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-gray-800 rounded hover:bg-black"
            >
              <FiPrinter size={16} />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900"
              aria-label="Close"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Content (screen) */}
        <div className="p-6 space-y-6" id="report-content">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-40">
              <div className="mb-3 h-8 w-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 border border-red-200 rounded bg-red-50 text-sm text-red-700">
              <FiAlertCircle className="mt-0.5" />
              <span>{error.detail || "Failed to load recommendation."}</span>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Predicted Crop */}
              <section className="box">
                <h2 className="uppercase tracking-wide text-xs text-gray-500 font-semibold">
                  Predicted Crop
                </h2>
                <div className="crop">
                  {predictedCrop || "N/A"}
                </div>
              </section>

              {/* Translated Summary */}
              {rec.translated_summary?.trim() ? (
                <section className="box">
                  <h2 className="uppercase tracking-wide text-xs text-gray-500 font-semibold">
                    Translated Summary
                  </h2>
                  <div className="text mt-2">
                    {renderParagraphs(rec.translated_summary)}
                  </div>
                </section>
              ) : null}

              {/* Agronomist Notes */}
              {rec.agronomist_notes?.trim() ? (
                <section className="box">
                  <h2 className="uppercase tracking-wide text-xs text-gray-500 font-semibold">
                    Agronomist Notes
                  </h2>
                  <div className="text mt-2">
                    {renderParagraphs(rec.agronomist_notes)}
                  </div>
                </section>
              ) : null}

              {/* Empty state */}
              {!predictedCrop && !rec.translated_summary?.trim() && !rec.agronomist_notes?.trim() && (
                <p className="text-sm text-gray-500">No report data available yet.</p>
              )}

              {/* Timestamp (subtle) */}
              {rec.timestamp && (
                <p className="muted">
                  Generated on {new Date(rec.timestamp).toLocaleString()}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecommendationReportModal