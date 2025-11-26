/**
 * Custom formatting for Judge.me review average
 * - Removes "out of 5" text
 * - Rounds rating to 1 decimal place (e.g., 5.00 → 5.0)
 * - Removes "Based on" text and verified checkmark from summary text
 * - Displays reviewer's first initial in profile icon
 */
(function() {
  function formatJudgeMeAverage() {
    const averageElement = document.querySelector('.jdgm-rev-widg__summary-average');
    
    if (averageElement) {
      const text = averageElement.textContent.trim();
      // Extract the number (e.g., "5.00" from "5.00 out of 5")
      const match = text.match(/(\d+\.?\d*)/);
      
      if (match) {
        const rating = parseFloat(match[1]);
        // Round to 1 decimal place
        const roundedRating = Math.round(rating * 10) / 10;
        // Format to always show 1 decimal (e.g., 5.0, 4.5)
        const formattedRating = roundedRating.toFixed(1);
        // Update the text to just the number
        averageElement.textContent = formattedRating;
      }
    }
  }

  function formatJudgeMeSummaryText() {
    const summaryTextElement = document.querySelector('.jdgm-rev-widg__summary-text, .jdgm-all-reviews__summary-text--verified');
    
    if (summaryTextElement) {
      // Remove the verified checkmark image
      const checkmark = summaryTextElement.querySelector('.jdgm-verified-checkmark');
      if (checkmark) {
        checkmark.remove();
      }
      
      // Extract the number and "review(s)" text
      const text = summaryTextElement.textContent.trim();
      // Match pattern like "Based on 1 review" or "Based on 5 reviews"
      const match = text.match(/(\d+)\s+(review|reviews)/i);
      
      if (match) {
        const number = match[1];
        const reviewText = match[2].toLowerCase();
        // Update to just show "# review(s)"
        summaryTextElement.textContent = `${number} ${reviewText}`;
      }
    }
  }

  function formatReviewIcons() {
    const reviewIcons = document.querySelectorAll('.jdgm-rev__icon');
    
    reviewIcons.forEach(function(icon) {
      // Skip if already processed (has text content)
      if (icon.textContent.trim()) {
        return;
      }
      
      // Find the reviewer name in the same review row
      const reviewRow = icon.closest('.jdgm-rev');
      if (!reviewRow) {
        return;
      }
      
      const authorElement = reviewRow.querySelector('.jdgm-rev__author');
      if (!authorElement) {
        return;
      }
      
      const authorName = authorElement.textContent.trim();
      if (authorName) {
        // Get first letter and make it uppercase
        const firstLetter = authorName.charAt(0).toUpperCase();
        icon.textContent = firstLetter;
      }
    });
  }

  // Try immediately in case Judge.me is already loaded
  formatJudgeMeAverage();
  formatJudgeMeSummaryText();
  formatReviewIcons();

  // Also listen for Judge.me's setup completion
  if (typeof window.judgeme !== 'undefined') {
    // Judge.me is already loaded
    formatJudgeMeAverage();
    formatJudgeMeSummaryText();
    formatReviewIcons();
  } else {
    // Wait for Judge.me to load
    const observer = new MutationObserver(function(mutations) {
      const averageElement = document.querySelector('.jdgm-rev-widg__summary-average');
      const summaryTextElement = document.querySelector('.jdgm-rev-widg__summary-text, .jdgm-all-reviews__summary-text--verified');
      
      if (averageElement && averageElement.textContent.includes('out of 5')) {
        formatJudgeMeAverage();
      }
      
      if (summaryTextElement && (summaryTextElement.textContent.includes('Based on') || summaryTextElement.querySelector('.jdgm-verified-checkmark'))) {
        formatJudgeMeSummaryText();
      }
      
      // Format review icons when new reviews are added
      formatReviewIcons();
    });

    // Start observing when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      });
    } else {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    // Fallback: check periodically
    const interval = setInterval(function() {
      const averageElement = document.querySelector('.jdgm-rev-widg__summary-average');
      const summaryTextElement = document.querySelector('.jdgm-rev-widg__summary-text, .jdgm-all-reviews__summary-text--verified');
      
      if (averageElement && averageElement.textContent.includes('out of 5')) {
        formatJudgeMeAverage();
      }
      
      if (summaryTextElement && (summaryTextElement.textContent.includes('Based on') || summaryTextElement.querySelector('.jdgm-verified-checkmark'))) {
        formatJudgeMeSummaryText();
      }
      
      formatReviewIcons();
    }, 500);

    // Stop checking after 10 seconds
    setTimeout(function() {
      clearInterval(interval);
      observer.disconnect();
    }, 10000);
  }
})();

